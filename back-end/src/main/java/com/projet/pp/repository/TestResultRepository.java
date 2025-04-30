    package com.projet.pp.repository;

    import com.projet.pp.model.TestOutcome;
    import com.projet.pp.model.TestResult;
    import org.springframework.data.jpa.repository.JpaRepository;
    import org.springframework.stereotype.Repository;

    @Repository
    public interface TestResultRepository extends JpaRepository<TestResult, Long> {

        /** Total tests run by this tester */
        long countByAssignment_Testeur_Id(Long testeurId);

        /** Total *failed* tests (where testOutcome = FAILED) */
        long countByAssignment_Testeur_IdAndTestOutcome(Long testeurId, TestOutcome testOutcome);
        long count();

        /** Count runs by outcome (SUCCESS or FAILURE) */
        long countByTestOutcome(TestOutcome testOutcome);
        long countByAssignment_Project_User_Id(Long userId);

        /**
         * Number of those runs on projects owned by the given user that had the given outcome.
         */
        long countByAssignment_Project_User_IdAndTestOutcome(
                Long userId,
                TestOutcome testOutcome
        );
    }