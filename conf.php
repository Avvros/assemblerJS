<?php
	// Не должен быть слишком маленьким, чтобы было чем заполнить 20 строк
	define('PAGE', 0x100); // размер сегмента кода и он же размер сегмента данных
	define('EXE_CS_OFFSET', 0x400); // начало сегмента кода в файле
	define('EXE_DS_OFFSET', 0x600); // начало сегмента данных в файле
	define('EXE_CS_ADDRESS', 0x401000); // начало сегмента кода в файле
	define('EXE_DS_ADDRESS', 0x402000); // начало сегмента данных в файле
	define('TASK_EXE_FULL_PATH', './task.exe');
	//define('JOBE_EXE_URL', 'http://jobe_exe/');
	//define('JOBE_EXE_URL', 'http://130.193.36.223/'); // yandex.ru
	define('JOBE_EXE_URL', 'http://81.91.179.181:3000/');	// сервер Димы Карелина
