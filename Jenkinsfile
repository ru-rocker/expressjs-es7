pipeline {
    agent any
    options {
        timeout(time: 15, unit: 'MINUTES')
    }
    environment {
        registry = [your_registry]
        registryPath = "test"
        registryCredential = [your_credential]
        myImage = ''
    }
    stages {

        stage("Initialize") {
            steps {
                script {
                    echo "${BUILD_NUMBER} - ${env.BUILD_ID} on ${env.JENKINS_URL}"
                    echo "JOB_NAME :: ${JOB_NAME}"
                    echo "GIT_URL :: ${GIT_CODE_URL}"
                    echo "GIT_BRANCH :: ${GIT_CODE_BRANCH}"
                }
            }
        }

        stage('Checkout') {
            steps {
                git branch: "${GIT_CODE_BRANCH}", url: "${GIT_CODE_URL}"
                script {
                    VERSION = getDate() + '.' + getShortCommitHash()
                    echo "VERSION :: ${VERSION}"
                }
            }
        }

        stage('Test') {
            steps {
                script{
                    docker.image('docker.elastic.co/elasticsearch/elasticsearch:7.5.2').withRun('-e discovery.type=single-node') { c ->
                        docker.image('node:12').inside(
                            "--link ${c.id}:elasticsearch -u 1001:1000 -e HOME=.") {

                            sh 'until $(curl --output /dev/null --silent --head --fail http://elasticsearch:9200); do printf "."; sleep 1; done'
                            sh 'npm install'
                            sh 'npm run coverage'
                        }
                    }
                }
            }
        }

        stage('Publish reports and analysis') {
            parallel {
                stage('Cobertura') {
                    steps {
                        cobertura autoUpdateHealth: false, autoUpdateStability: false,
                                coberturaReportFile: '**/coverage/cobertura-coverage.xml',
                                conditionalCoverageTargets: '70, 0, 0', failUnhealthy: false,
                                failUnstable: false, lineCoverageTargets: '80, 0, 0',
                                maxNumberOfBuilds: 0, methodCoverageTargets: '80, 0, 0',
                                onlyStable: false, sourceEncoding: 'ASCII', zoomCoverageChart: false
                    }
                }
                stage('Sonar Analysis') {
                    steps {
                        script {
                            docker.image('myregistry/sonar-scanner-cli:4.2.0').inside("-e SONAR_LOGIN=${SONAR_LOGIN}") {

                                sh 'sonar-scanner -Dsonar.projectKey=${SONAR_PROJECT_KEY}'
                                SONAR_RESULT = sh(
                                    script:'''
                                        curl -XGET -u ${SONAR_LOGIN}: https://your_sonar_url/api/qualitygates/project_status?projectKey=${SONAR_PROJECT_KEY} | jq -r .projectStatus.status
                                    ''',
                                    returnStdout: true
                                )

                                echo "sonar analysis result: ${SONAR_RESULT}"
                                if(!SONAR_RESULT.trim().equalsIgnoreCase('OK')) {
                                    currentBuild.result = "FAILURE"
                                    throw new Exception("Does not pass quality gateway")
                                }
                            }
                        }
                    }
                }
            }
        }

        stage('Building docker Image') {
            steps {
                script {
                    myImage = docker.build("${registry}/${registryPath}/${IMAGE_NAME}:${VERSION}")
                }
            }
        }

        stage('Deploy docker Image') {
            steps{
                script {
                    docker.withRegistry('https://' + registry, registryCredential ) {
                         myImage.push()
                         myImage.push('latest')
                    }
                }
            }
        }
    }
}

def getShortCommitHash() {
    return sh(returnStdout: true, script: "git log -n 1 --pretty=format:'%h'").trim()
}

def getDate() {
    return sh(returnStdout: true, script: "git show -s --format=%cd --date=short | tr -d -").trim()
}
