
pipeline {
  agent{ label 'mini' }
  environment {
    ib = "${JOB_BASE_NAME}"
    tb = ib.replace('_tst', '')
    cs = '/1c/cmd/bat/testIB-restore-sql/create-script.os'
    CLADDR = 'obr-app-13'
    SQLSRV = 'obr-sql-01'
    SQLbackup = '\\\\192.168.3.56\\backup'
    VER1C = '8.3.18.1483'
    enCode = '0008'
    scPath = "\\tmp\\SQL_${ib}.SQLscript"

  }
  stages {
    stage('1. Подготовка') {
      steps {
        script {
          withCredentials([usernamePassword(credentialsId: 'ClusterAdmin', passwordVariable: 'clPASSWD', usernameVariable: 'clADMIN')
            , usernamePassword(credentialsId: 'IBadmin', passwordVariable: 'ibPASSWORD', usernameVariable: 'ibADMIN')]) {
            def command = """vrunner session kill --ras ${CLADDR}
                --cluster-admin ${ clADMIN } --cluster-pwd ${ clPASSWD }
                --ibconnection / s${ CLADDR } \\${ ib }
                --db ${ ib } --db-user ${ ibADMIN } --db-pwd ${ ibPASSWORD }
                --uccode ${ enCode } --v8version ${ VER1C }
                """

          command = command.replace("\n", " ")
          echo "command: " + command

          bat """chcp 65001
              ${ command } """
          }
        }
      }
    }
    stage('2. Подключение каталога с бэкапами') {
      steps {
        script {
        environment {
                    command = ""
        }
          withCredentials(usernamePassword(credentialsId: 'goblin_moscollector', passwordVariable: 'netUser', usernameVariable: 'netPasswd') {
            command = "net use ${SQLbackup} ${netPasswd} /user:${netUser}"
            echo "command: " + command
            bat """chcp 65001
                ${ command }"""
          }
        }
      }
    }
    stage ('3. Формирование скрипта загрузки') {
      steps {
        script {
           def command = "oscript ${cs} ${ib} ${tb} ${scPath}"
           echo "command: " + command
           bat """chcp 65001
                ${ command } """
        }
      }
    }
    stage ('4. Загрузка ИБ из бэкапа') {
      steps {
        script {
          withCredentials(usernamePassword(credentialsId: 'SQLadmin', passwordVariable: 'SQLpasswd', usernameVariable: 'SQLadmin')) {
            def command = "sqlcmd -S ${SQLSRV} -U ${SQLadmin} -P ${SQLpasswd} -i ${scPath}"
            echo "command: " + command
            bat """chcp 65001
            ${ command } """
          }
        }
      }
    }
  }
  post {
    always { script {
        withCredentials([usernamePassword(credentialsId: 'ClusterAdmin', passwordVariable: 'clPASSWD', usernameVariable: 'clADMIN')
            , usernamePassword(credentialsId: 'IBadmin', passwordVariable: 'ibPASSWORD', usernameVariable: 'ibADMIN')]) {
            def command = """vrunner session unlock
            --ras ${ CLADDR }
            --cluster-admin ${ clADMIN }
            --cluster-pwd ${ clPASSWD }
            --ibconnection / s${ CLADDR } \\${ ib }
            --db ${ ib } --db-user ${ ibADMIN }
            --db-pwd ${ ibPASSWORD }
            --uccode ${ enCode }
            --v8version ${ VER1C } """

            command = command.replace("\n", " ")
            command = command.replace("\t", " ")
            command = command.replace("  ", " ")
            echo "command: " + command

            bat """chcp 65001>nul
                $command"""
        }
    } }
  }
}