<?php

declare(strict_types=1);

namespace PractiPro\Repositories;

/**
 * The two questionnaires: the student's final report (exit poll) and the
 * supervisor's performance evaluation of a student, plus their per-class
 * analytics.
 */
final class ReportRepository extends Repository
{
    public const FINAL_REPORT_ANSWERS = [
        'p1q1', 'p1q2', 'p1q3', 'p1q4', 'p1q5', 'p1q6', 'p1q7', 'p1q7x1', 'p1q7x2',
        'p2q1', 'p2q1x1', 'p2q2', 'p2q2x1', 'p2q3', 'p2q3x1', 'p2q4', 'p2q4x1', 'p2q5', 'p2q5x1',
        'p3q1', 'p4q1',
    ];

    public const EVALUATION_ANSWERS = [
        'p1q1', 'p1q2', 'p1q3', 'p1q4', 'p1q5',
        'p2q1', 'p2q2', 'p2q3', 'p2q4', 'p2q5', 'p2q6', 'p2q7', 'p2q8',
        'p3q1', 'p3q2', 'p3q3', 'p3q4', 'p3q5', 'p3q6', 'p3q7', 'p3q8', 'p3q9', 'p3q10', 'p3q11', 'p3q12', 'p3q13',
        'p4q1',
        'p5q1', 'p5q2', 'p5q3', 'p5q4', 'p5q5', 'p5q6x1', 'p5q6',
    ];

    private const RATING_LABELS = ['Poor' => 'poor', 'Fair' => 'fair', 'Good' => 'good', 'Very Good' => 'verygood', 'Excellent' => 'excellent'];

    /**
     * @return list<array<string, mixed>>
     */
    public function finalReportOf(int $studentId): array
    {
        return $this->db->fetchAll('SELECT * FROM student_final_reports WHERE user_id = ?', [$studentId]);
    }

    /**
     * @param array<string, mixed> $answers
     */
    public function createFinalReport(int $studentId, array $answers): void
    {
        $this->insertAnswers('student_final_reports', ['user_id' => $studentId], self::FINAL_REPORT_ANSWERS, $answers);
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function evaluationOf(int $studentId): array
    {
        return $this->db->fetchAll('SELECT * FROM student_supervisor_evaluation WHERE student_id = ?', [$studentId]);
    }

    /**
     * @param array<string, mixed> $answers
     */
    public function createEvaluation(int $supervisorId, int $studentId, array $answers): void
    {
        $this->insertAnswers(
            'student_supervisor_evaluation',
            ['supervisor_id' => $supervisorId, 'student_id' => $studentId],
            self::EVALUATION_ANSWERS,
            $answers,
        );
    }

    /**
     * Answer counts for a class's final reports: how many said yes/no, etc.
     *
     * @return list<array<string, mixed>>
     */
    public function finalReportAnalytics(string $block): array
    {
        $counts = [];
        foreach (['p1q1', 'p1q2', 'p1q3', 'p1q4', 'p1q5', 'p1q6', 'p1q7'] as $question) {
            $counts[] = self::countWhere("sfr.$question = 'yes'", "{$question}_yes_count");
            $counts[] = self::countWhere("sfr.$question = 'no'", "{$question}_no_count");
        }
        $counts[] = self::countWhere("sfr.p1q7x1 = 'meal'", 'p1q7x1_meal_count');
        $counts[] = self::countWhere("sfr.p1q7x1 = 'cash'", 'p1q7x1_cash_count');
        $counts[] = self::countWhere('sfr.p1q7x1 IS NULL', 'p1q7x1_null_count');

        // How much of the curriculum was applied (0-100%), counted across the five part-2 questions.
        foreach (['0', '25', '50', '75', '100'] as $percent) {
            $anyAnswer = implode(' OR ', array_map(fn (int $q) => "sfr.p2q{$q}x1 = '$percent'", range(1, 5)));
            $counts[] = self::countWhere($anyAnswer, "p2x1_$percent");
        }
        foreach (self::RATING_LABELS as $rating => $suffix) {
            $counts[] = self::countWhere("sfr.p3q1 = '$rating'", "p3q1_$suffix");
        }

        return $this->db->fetchAll(
            'SELECT ' . implode(",\n", $counts) . '
             FROM student_final_reports sfr
             JOIN students s ON sfr.user_id = s.id
             WHERE s.block = ?',
            [$block],
        );
    }

    /**
     * How many students in a class got each score (1-5) on each evaluation question.
     *
     * @return list<array<string, mixed>>
     */
    public function evaluationAnalytics(string $block): array
    {
        $questions = [
            ...array_map(fn (int $q) => "p1q$q", range(1, 5)),
            ...array_map(fn (int $q) => "p2q$q", range(1, 8)),
            ...array_map(fn (int $q) => "p3q$q", range(1, 13)),
        ];

        $counts = [];
        foreach ($questions as $question) {
            foreach (range(1, 5) as $score) {
                $counts[] = self::countWhere("sse.$question = '$score'", "{$question}_$score");
            }
        }
        foreach (self::RATING_LABELS as $rating => $suffix) {
            $counts[] = self::countWhere("sse.p4q1 = '$rating'", "p4q1_$suffix");
        }

        return $this->db->fetchAll(
            'SELECT ' . implode(",\n", $counts) . '
             FROM student_supervisor_evaluation sse
             JOIN students s ON sse.student_id = s.id
             WHERE s.block = ?',
            [$block],
        );
    }

    /**
     * Builds a "SUM(CASE WHEN ... THEN 1 ELSE 0 END) AS alias" column.
     * Only ever called with the fixed strings above, never with client input.
     */
    private static function countWhere(string $condition, string $alias): string
    {
        return "SUM(CASE WHEN $condition THEN 1 ELSE 0 END) AS $alias";
    }

    /**
     * @param array<string, int>   $ids
     * @param list<string>         $answerColumns
     * @param array<string, mixed> $answers
     */
    private function insertAnswers(string $table, array $ids, array $answerColumns, array $answers): void
    {
        $values = $ids;
        foreach ($answerColumns as $column) {
            $values[$column] = $answers[$column] ?? null;
        }

        $columns = implode(', ', array_keys($values));
        $placeholders = implode(', ', array_fill(0, count($values), '?'));
        $this->db->execute("INSERT INTO $table ($columns) VALUES ($placeholders)", array_values($values));
    }
}
