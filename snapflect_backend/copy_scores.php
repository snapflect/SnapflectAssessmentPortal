<?php
$pdo = new PDO('sqlite:d:/Mubarak/SnapFlectMobileWebApp/Snapflect Assessment Portal/snapflect_backend/database/database.sqlite');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {
    // Result 14 is UUID 923ade9f-dbb4-4d5e-9ac0-9ea0c42a6577
    $targetResultId = 14;
    // Get the latest result ID for the same attempt
    $stmt = $pdo->query("SELECT id FROM assessment_results WHERE assessment_attempt_id = 7 ORDER BY id DESC LIMIT 1");
    $latestResultId = $stmt->fetchColumn();

    if ($latestResultId && $latestResultId != $targetResultId) {
        $stmt = $pdo->prepare("SELECT * FROM competency_scores WHERE assessment_result_id = ?");
        $stmt->execute([$latestResultId]);
        $scores = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Delete existing scores for target to prevent duplicates if any
        $pdo->prepare("DELETE FROM competency_scores WHERE assessment_result_id = ?")->execute([$targetResultId]);

        foreach ($scores as $score) {
            $stmt = $pdo->prepare("INSERT INTO competency_scores (uuid, organization_id, assessment_result_id, competency_id, competency_score, competency_percentage, threshold_score, competency_status, status, created_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex(random_bytes(16)), 4)), // simple uuid
                $score['organization_id'],
                $targetResultId,
                $score['competency_id'],
                $score['competency_score'],
                $score['competency_percentage'],
                $score['threshold_score'],
                $score['competency_status'],
                $score['status'],
                $score['created_date']
            ]);
        }
        echo "Copied " . count($scores) . " competency scores from Result $latestResultId to Result $targetResultId.\n";
    } else {
        echo "Latest is already $targetResultId or none found.\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
