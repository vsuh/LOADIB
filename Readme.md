﻿Задача для Jenkins загрузки бэкапа в информационную базу 

Имя загружаемой информационной базы должно соответствовать названию задачи
Имя базы-источника вычисляется как первые 6 символов имени тестовой базы



> для работы с git.moscollector.local под пользователем, 
из-под которого выполняется jenkins агент (goblin@moscollector), 
была сформирована пара файлов ssh - ключа и, с помощью публичной 
части ключа, ssh-ключ был объявлен на сервере gitlab 
(Настройки пользователя - Ключи SSH - Добавить ключ), 
а секретная часть размещена в `c:\windows\system32\.ssh`, 
видимо из-за того, что пользователь доменный, а не локальный 
на машине агента.
