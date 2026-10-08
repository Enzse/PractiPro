<?php

//set time limit of requests
set_time_limit(1000);

class Connection{
    private $options = [
        \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
        \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
        \PDO::ATTR_EMULATE_PREPARES => false
    ];


    public function connect(){
        $dsn = "mysql:host=" . $_ENV['DB_HOST'] . ";dbname=" . $_ENV['DB_NAME'] . ";charset=utf8mb4";
        return new \PDO($dsn, $_ENV['DB_USER'], $_ENV['DB_PASSWORD'], $this->options);
    }
}

?>
