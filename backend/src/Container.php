<?php

declare(strict_types=1);

namespace PractiPro;

use Closure;
use ReflectionClass;
use ReflectionNamedType;

/**
 * A small dependency injection container.
 *
 * Asking for a class builds it by reading its constructor's type hints and
 * building those dependencies the same way, recursively. Interfaces and
 * classes that need configuration (PDO, the mailer) are registered up front
 * with bind(). Each class is built once per container and then reused.
 */
final class Container
{
    /** @var array<string, Closure(self): object> */
    private array $factories = [];

    /** @var array<string, object> */
    private array $instances = [];

    /**
     * @param class-string $id
     * @param Closure(self): object $factory
     */
    public function bind(string $id, Closure $factory): void
    {
        $this->factories[$id] = $factory;
        unset($this->instances[$id]);
    }

    /**
     * @template T of object
     * @param class-string<T> $id
     * @return T
     */
    public function get(string $id): object
    {
        if (!isset($this->instances[$id])) {
            $this->instances[$id] = isset($this->factories[$id])
                ? ($this->factories[$id])($this)
                : $this->build($id);
        }

        /** @var T */
        return $this->instances[$id];
    }

    /**
     * @param class-string $class
     */
    private function build(string $class): object
    {
        $reflection = new ReflectionClass($class);
        if (!$reflection->isInstantiable()) {
            throw new \LogicException("Cannot build $class: bind it in the container first.");
        }

        $constructor = $reflection->getConstructor();
        if ($constructor === null) {
            return new $class();
        }

        $arguments = [];
        foreach ($constructor->getParameters() as $parameter) {
            $type = $parameter->getType();
            if ($type instanceof ReflectionNamedType && !$type->isBuiltin()) {
                /** @var class-string $dependency */
                $dependency = $type->getName();
                $arguments[] = $this->get($dependency);
            } elseif ($parameter->isDefaultValueAvailable()) {
                $arguments[] = $parameter->getDefaultValue();
            } else {
                throw new \LogicException("Cannot build $class: don't know how to provide \${$parameter->getName()}.");
            }
        }

        return $reflection->newInstanceArgs($arguments);
    }
}
