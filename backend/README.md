# backend

Java 21, Spring Boot 3.3.5 (hand-pinned — start.spring.io no longer serves a
3.x line; see `pom.xml`). Flyway owns the schema
(`src/main/resources/db/migration/V1__initial_schema.sql`).

## Requisito: JDK 21, não o padrão do sistema

Lombok não roda no JDK 25 nesta máquina (`ExceptionInInitializerError:
com.sun.tools.javac.code.TypeTag :: UNKNOWN` — o annotation processor não é
compatível com javac dessa versão ainda). Aponte `JAVA_HOME` para um JDK 21
antes de compilar:

```sh
export JAVA_HOME="/c/Program Files/Eclipse Adoptium/jdk-21.0.11.10-hotspot"
```

(ajuste o caminho para onde o JDK 21 estiver instalado na sua máquina).

## Setup

```sh
cp .env.example .env
# exportar as variáveis do .env no shell (Spring Boot não lê .env sozinho)
export $(cat .env | xargs)   # bash; no PowerShell, ver abaixo

docker compose -f ../docker-compose.dev.yml up -d postgres mailpit
./mvnw spring-boot:run
```

PowerShell:

```powershell
Get-Content .env | ForEach-Object {
  if ($_ -match '^([^#=]+)=(.*)$') { Set-Item "Env:$($Matches[1])" $Matches[2] }
}
```

## Porta do Postgres local

`docker-compose.dev.yml` publica o Postgres em `5440`, não `5432` — esta
máquina já roda vários outros projetos, cada um com seu próprio Postgres
ocupando portas de `5432` a `5442`. Se a sua máquina não tiver esse
conflito, `5432` funciona normalmente; só ajustar a porta publicada e
`SPRING_DATASOURCE_URL`.

## Scripts

- `./mvnw spring-boot:run` — inicia em modo dev
- `./mvnw test` — testes unitários e de integração
- `./mvnw clean package -DskipTests` — build de produção
