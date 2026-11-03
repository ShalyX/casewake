"""Synthetic behavioral tests for review-only incident and indexer recommendations."""
import unittest
from ecosystem_spike import *

class ValidationTests(unittest.TestCase):
    def setUp(self):
        self.failed = TxFailure("SYNTHETIC_DIGEST_A", "sui-mainnet", "onchain", "MoveAbort::42", "0xpackage", 2)
        self.mem = IncidentMemory("case-1", "sui-mainnet", "onchain", "MoveAbort::42", "0xpackage", 2, "human_verified", "Review object preconditions", "https://example.org/verified-case")
        self.snap = IndexerSnapshot("sui-mainnet", "events", 1_200_000, 1_180_000, 5, 5, "1.80.0", "checkpoint_backlog")
        self.runbook = RunbookMemory("run-1", "sui-mainnet", "events", "1.80.0", "checkpoint_backlog", "human_verified", "Inspect pipeline restart and backfill", "https://example.org/runbook")

    def test_incident_verified_exact_match(self):
        self.assertEqual(incident_candidate(self.failed, [self.mem]), self.mem)

    def test_incident_unverified_cannot_guide(self):
        m = IncidentMemory(**{**self.mem.__dict__, "verification":"unconfirmed"})
        self.assertIsNone(incident_candidate(self.failed, [m]))

    def test_incident_wrong_package_cannot_guide(self):
        m = IncidentMemory(**{**self.mem.__dict__, "package":"0xother"})
        self.assertIsNone(incident_candidate(self.failed, [m]))

    def test_incident_sdk_version_mismatch_cannot_guide(self):
        m = IncidentMemory(**{**self.mem.__dict__, "sdk_major":1})
        self.assertIsNone(incident_candidate(self.failed, [m]))

    def test_transport_not_onchain_execution(self):
        failure = TxFailure("SYNTHETIC_DIGEST", "sui-mainnet", "transport", "UNAVAILABLE", "0xpackage", 2)
        self.assertIsNone(incident_candidate(failure, [self.mem]))

    def test_indexer_lag_verified_exact_match(self):
        self.assertEqual(indexer_candidate(self.snap, [self.runbook]), ("REVIEW_RUNBOOK", self.runbook))

    def test_indexer_stale_pipeline_metrics_do_not_guide(self):
        s = IndexerSnapshot(**{**self.snap.__dict__, "snapshot_age_seconds":500})
        self.assertEqual(indexer_candidate(s, [self.runbook])[0], "STALE_DATA")

    def test_indexer_stale_network_tip_do_not_guide(self):
        s = IndexerSnapshot(**{**self.snap.__dict__, "network_tip_age_seconds":500})
        self.assertEqual(indexer_candidate(s, [self.runbook])[0], "STALE_DATA")

    def test_indexer_no_significant_lag(self):
        s = IndexerSnapshot(**{**self.snap.__dict__, "pipeline_checkpoint":1_199_800})
        self.assertEqual(indexer_candidate(s, [self.runbook])[0], "NO_SIGNIFICANT_LAG")

    def test_indexer_version_specificity(self):
        r = RunbookMemory(**{**self.runbook.__dict__, "indexer_version":"1.79.0"})
        self.assertEqual(indexer_candidate(self.snap, [r])[0], "DIAGNOSE_MANUALLY")

    def test_indexer_pipeline_specificity(self):
        r = RunbookMemory(**{**self.runbook.__dict__, "pipeline":"objects"})
        self.assertEqual(indexer_candidate(self.snap, [r])[0], "DIAGNOSE_MANUALLY")

    def test_indexer_invalid_watermark(self):
        s = IndexerSnapshot(**{**self.snap.__dict__, "network_tip":1_100_000})
        self.assertEqual(indexer_candidate(s, [self.runbook])[0], "INVALID_WATERMARK")

    def test_unverified_runbook_never_applies(self):
        r = RunbookMemory(**{**self.runbook.__dict__, "verification":"unconfirmed"})
        self.assertEqual(indexer_candidate(self.snap, [r])[0], "DIAGNOSE_MANUALLY")

if __name__ == "__main__":
    unittest.main(verbosity=2)
