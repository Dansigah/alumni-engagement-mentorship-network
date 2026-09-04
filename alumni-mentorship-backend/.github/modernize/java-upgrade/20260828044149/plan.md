# Upgrade Plan: alumni-mentorship-backend (20260828044149)

- **Generated**: 2026-08-28
- **HEAD Branch**: main
- **HEAD Commit ID**: unavailable from precheck metadata

## Available Tools

**JDKs**
- JDK 21.0.12.1: `C:\Program Files\Java\jdk-21.0.12.1\bin` (current project JDK, used by baseline)
- JDK 25: **<TO_BE_INSTALLED>** (required by upgrade and final validation)

**Build Tools**
- Maven Wrapper: 3.9.16 (`mvnw.cmd`, compatible with Java 25)

## Guidelines

> Note: You can add any specific guidelines or constraints for the upgrade process here if needed, bullet points are preferred.

## Options

- Working branch: appmod/java-upgrade-20260828044149
- Run tests before and after the upgrade: true
- Auto-execution: true

## Upgrade Goals

- Java runtime/compiler target: 25 (latest LTS)

## Technology Stack

| Technology/Dependency | Current | Min Compatible Version | Why Incompatible |
| --------------------- | ------- | ---------------------- | ---------------- |
| Java | 21 | 25 | User requested latest LTS runtime |
| Spring Boot | 4.1.1 | 4.1.1 | Already compatible with Java 25 |
| Maven Wrapper | 3.9.16 | 3.9.0 | Already compatible with Java 25 |
| maven-compiler-plugin | Spring Boot-managed | 3.11.0+ recommended | Managed plugin is expected to support the Java 25 release; verify during build |
| JUnit/Spring Boot test starters | Spring Boot-managed | Current | Verify test compilation and execution on Java 25 |

## Derived Upgrades

- Install JDK 25 because the requested target compiler/runtime is unavailable locally.
- Keep Maven Wrapper 3.9.16 because it already meets the Java 25 build-tool requirement.
- Keep Spring Boot 4.1.1 and its managed dependencies because no framework upgrade was requested and the current line supports the target runtime.
- No Kotlin dependencies were detected, so no Kotlin upgrade is required.

## Impact Analysis

### Dependency Changes

| File | Dependency | Current | Action | Target | Reason |
|------|-----------|---------|--------|--------|--------|
| `pom.xml` | `java.version` property | 21 | upgrade | 25 | Sets Spring Boot's compiler release and project Java target |
| `pom.xml` | Spring Boot parent | 4.1.1 | keep | 4.1.1 | No change required for Java 25 target |
| `.mvn/wrapper/maven-wrapper.properties` | Maven distribution | 3.9.16 | keep | 3.9.16 | Compatible with Java 25 |

### Source Code Changes

| File | Location | Current | Required Change | Reason |
|------|----------|---------|----------------|--------|
| None | N/A | No Java 25-incompatible APIs found in the source scan | None | The requested change is a compiler/runtime target change only |

### Configuration Changes

| File | Property/Setting | Current | Required Change | Reason |
|------|------------------|---------|----------------|--------|
| `pom.xml` | `java.version` | 21 | Change to `25` | Compile and test against Java 25 |

### CI/CD Changes

| File | Location | Current | Required Change |
|------|----------|---------|----------------|
| None detected | N/A | No CI/CD files with hardcoded Java versions found | None |

### Risks & Warnings

- **JDK 25 availability**: Java 25 is absent locally and must be installed before target verification. **Mitigation**: Install JDK 25, then run wrapper compile and full tests using that JDK.
- **Managed compiler plugin compatibility**: The compiler plugin version is inherited from Spring Boot. **Mitigation**: Let the Java 25 compile step expose incompatibility; upgrade only the plugin if the build demonstrates a concrete issue.
- **Runtime-only compatibility**: Existing tests may not exercise every reflective or database-backed path. **Mitigation**: Run the complete test suite and retain the existing Spring Boot test context validation.
- **CVE status**: Dependency vulnerabilities must be checked after the target change. **Mitigation**: Extract direct dependencies, scan, apply only necessary patched versions, rebuild, and rescan.

## Upgrade Steps

- Step 1: Setup Environment
  - **Rationale**: Make JDK 25 available while preserving Java 21 for the baseline.
  - **Changes to Make**: Install required JDK 25 and verify Maven Wrapper availability.
  - **Verification**: List JDKs and confirm JDK 25 is available; no source changes.

- Step 2: Setup Baseline
  - **Rationale**: Establish pre-upgrade compilation and test pass rate under Java 21.
  - **Changes to Make**: None.
  - **Verification**: `mvnw.cmd clean compile test-compile -q` and `mvnw.cmd clean test -q` using Java 21; expected baseline success or documented pre-existing failures.

- Step 3: Upgrade Java Target
  - **Rationale**: Apply the requested Java 25 compiler/runtime target after baseline evidence exists.
  - **Changes to Make**: Apply the Dependency and Configuration Changes above in `pom.xml`.
  - **Verification**: `mvnw.cmd clean test-compile -q` using JDK 25; expected successful main and test compilation.

- Step 4: CVE Validation and Fix
  - **Rationale**: Ensure the final dependency set has no known vulnerabilities introduced or exposed by the upgrade.
  - **Changes to Make**: Scan direct dependencies and apply minimal patched dependency updates if reported.
  - **Verification**: Build successfully and rescan; expected no actionable CVEs.

- Step 5: Final Validation
  - **Rationale**: Confirm all goals and preserve behavior after the Java target change.
  - **Changes to Make**: Resolve any compile/test failures and remove temporary workarounds.
  - **Verification**: `mvnw.cmd clean test-compile -q`, `mvnw.cmd clean test -q`, and `mvnw.cmd clean verify -Djacoco.skip=false` using JDK 25; expected 100% test pass rate and successful verification.
