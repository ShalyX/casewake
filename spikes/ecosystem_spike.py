"""Deterministic safety filter for two ecosystem idea spikes.

All fixtures in this directory are synthetic. This does not call Tatum or Walrus.
A live adapter must eventually supply chain facts and recalled memory candidates.
"""
from dataclasses import dataclass
from typing import Optional

@dataclass(frozen=True)
class TxFailure:
    digest: str
    network: str
    layer: str
    error_code: str
    package: str
    sdk_major: int

@dataclass(frozen=True)
class IncidentMemory:
    id: str
    network: str
    layer: str
    error_code: str
    package: str
    sdk_major: int
    verification: str
    resolution: str
    evidence_url: str

def incident_candidate(failure: TxFailure, recalled: list[IncidentMemory]) -> Optional[IncidentMemory]:
    """Return a *candidate*, never a confirmed automatic fix."""
    if not failure.digest or not failure.error_code or failure.layer != "onchain":
        return None
    eligible = [
        m for m in recalled
        if m.verification == "human_verified"
        and m.layer == failure.layer
        and m.network == failure.network
        and m.error_code == failure.error_code
        and m.package == failure.package
        and m.sdk_major == failure.sdk_major
        and m.evidence_url.startswith("https://")
    ]
    return eligible[0] if eligible else None

@dataclass(frozen=True)
class IndexerSnapshot:
    network: str
    pipeline: str
    network_tip: int
    pipeline_checkpoint: int
    snapshot_age_seconds: int
    network_tip_age_seconds: int
    indexer_version: str
    symptom: str
    lag_threshold: int = 1000

@dataclass(frozen=True)
class RunbookMemory:
    id: str
    network: str
    pipeline: str
    indexer_version: str
    symptom: str
    verification: str
    action: str
    evidence_url: str

def indexer_candidate(snapshot: IndexerSnapshot, recalled: list[RunbookMemory]) -> tuple[str, Optional[RunbookMemory]]:
    """Use live freshness + exact constraints to avoid treating semantic recall as truth."""
    if snapshot.snapshot_age_seconds > 120 or snapshot.network_tip_age_seconds > 120:
        return "STALE_DATA", None
    if snapshot.network_tip < snapshot.pipeline_checkpoint:
        return "INVALID_WATERMARK", None
    if snapshot.network_tip - snapshot.pipeline_checkpoint < snapshot.lag_threshold:
        return "NO_SIGNIFICANT_LAG", None
    candidates = [
        m for m in recalled
        if m.verification == "human_verified"
        and m.network == snapshot.network
        and m.pipeline == snapshot.pipeline
        and m.indexer_version == snapshot.indexer_version
        and m.symptom == snapshot.symptom
        and m.evidence_url.startswith("https://")
    ]
    return ("REVIEW_RUNBOOK", candidates[0]) if candidates else ("DIAGNOSE_MANUALLY", None)
