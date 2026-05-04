Feature: DBSCAN clustering of polygon-derived bounding boxes

Background:
Given a deterministic clustering system
And a neighborhood function defined as:
    distance(a, b) = minimum Euclidean distance between axis-aligned rectangles
And Neighbor(a, b, eps) ⇔ distance(a, b) <= eps
And eps >= 0
And minPts >= 1

---

Scenario S-001: Empty input produces empty result

Given a set of bounding boxes B where |B| = 0
When DBSCAN is executed with eps = any, minPts = any
Then the result shall contain 0 clusters
And the result shall contain 0 noise items
And total output items = 0

---

Scenario S-002: Single element becomes cluster when minPts = 1

Given a set of bounding boxes B where |B| = 1
And minPts = 1
When DBSCAN is executed
Then the result shall contain exactly 1 cluster
And that cluster shall contain the single bounding box
And noise set shall be empty

---

Scenario S-003: Single element becomes noise when minPts > 1

Given a set of bounding boxes B where |B| = 1
And minPts > 1
When DBSCAN is executed
Then the result shall contain 0 clusters
And the result shall contain exactly 1 noise item

---

Scenario S-004: Two boxes within eps form a cluster when density satisfied

Given bounding boxes A and B
And distance(A, B) <= eps
And minPts = 2
When DBSCAN is executed
Then A and B shall belong to the same cluster
And the cluster size shall be 2
And no noise items shall exist

---

Scenario S-005: Two boxes outside eps are not neighbors

Given bounding boxes A and B
And distance(A, B) > eps
And minPts = 2
When DBSCAN is executed
Then A shall not be a neighbor of B
And B shall not be a neighbor of A
And both A and B shall be classified as noise

---

Scenario S-006: Overlapping boxes have zero distance

Given bounding boxes A and B
And A intersects B
Then distance(A, B) = 0

Given eps >= 0
When DBSCAN is executed
Then A and B shall be neighbors

---

Scenario S-007: Touching boxes are neighbors

Given bounding boxes A and B
And A and B share a boundary (edge or corner)
Then distance(A, B) = 0

Given eps >= 0
When DBSCAN is executed
Then A and B shall be neighbors

---

Scenario S-008: Core point satisfies density condition

Given bounding box P
And neighborhood N(P) = { Q ∈ B | Neighbor(P, Q, eps) }
And |N(P)| >= minPts
When DBSCAN is executed
Then P shall be classified as a core point

---

Scenario S-009: Border point is reachable from core but not dense

Given bounding box P where |N(P)| < minPts
And there exists a core point C such that P ∈ N(C)
When DBSCAN is executed
Then P shall be classified as a border point
And P shall belong to the same cluster as C

---

Scenario S-010: Noise point is not reachable

Given bounding box P
And |N(P)| < minPts
And for all core points C: P ∉ N(C)
When DBSCAN is executed
Then P shall be classified as noise

---

Scenario S-011: Chain density connectivity forms single cluster

Given bounding boxes A, B, C
And distance(A, B) <= eps
And distance(B, C) <= eps
And distance(A, C) > eps
And minPts = 2
When DBSCAN is executed
Then A, B, and C shall belong to the same cluster

---

Scenario S-012: Multiple dense regions form separate clusters

Given two sets of bounding boxes G1 and G2
And for all a ∈ G1, b ∈ G2: distance(a, b) > eps
And each set satisfies density independently
When DBSCAN is executed
Then G1 shall form one cluster
And G2 shall form one cluster
And no cluster shall contain elements from both sets

---

Scenario S-013: Total conservation of input

Given a set of bounding boxes B
When DBSCAN is executed
Then |clusters ∪ noise| = |B|
And no bounding box shall appear more than once
And no bounding box shall be lost

---

Scenario S-014: Deterministic output

Given identical input set B
And identical eps and minPts
When DBSCAN is executed multiple times
Then the cluster memberships shall be identical
And the ordering of clusters shall be deterministic
And the ordering of items within clusters shall be deterministic

---

Scenario S-015: Bounding boxes from open and closed polygons behave identically

Given bounding boxes A and B
And A originates from an open polygon
And B originates from a closed polygon
And their geometry satisfies Neighbor(A, B, eps)
When DBSCAN is executed
Then clustering shall depend only on bounding box geometry
And polygon openness shall not affect cluster membership

---

Scenario S-016: Degenerate bounding boxes are supported

Given bounding box A where width = 0 or height = 0
And A is otherwise valid
When DBSCAN is executed
Then A shall participate in clustering using distance rules
And no special-case exclusion shall occur

---

Scenario S-017: Cluster exclusivity

Given a set of bounding boxes B
When DBSCAN is executed
Then each bounding box shall belong to exactly one of:
    - one cluster
    - noise
And no bounding box shall belong to multiple clusters

---

Scenario S-018: Stable cluster identity

Given clusters C1, C2, ..., Cn
When DBSCAN is executed
Then cluster identifiers shall be stable for identical input
And cluster ordering shall follow a deterministic rule

---
Appendix A: Spatial Index Requirement (QuadTree)

## A.1 Purpose

This appendix defines the mandatory use of a QuadTree spatial index to support efficient neighborhood queries in DBSCAN clustering of bounding boxes.

The QuadTree is an internal optimization component and must not alter the observable behavior defined in the main specification.

---

## A.2 Requirement

Given a set of bounding boxes B

When DBSCAN is executed

Then all neighborhood queries SHALL be resolved using a QuadTree-based spatial index

And the QuadTree SHALL be constructed from the full set B prior to clustering

---

## A.3 Behavioral Invariance

Given a dataset B and parameters (eps, minPts)

When DBSCAN is executed:
- using a QuadTree-based neighborhood query
- and using a naive O(n²) neighborhood query

Then the resulting clusters SHALL be identical

And the noise classification SHALL be identical

And ordering rules defined in the main specification SHALL remain unchanged

---

## A.4 QuadTree Construction

Given a set of bounding boxes B

When the QuadTree is constructed

Then each bounding box SHALL be inserted exactly once

And the QuadTree SHALL index bounding boxes using their spatial extent (minX, minY, maxX, maxY)

And the QuadTree SHALL support range queries over axis-aligned rectangular regions

---

## A.5 Neighborhood Query via QuadTree

Given a bounding box P
And a search radius eps

When a neighborhood query is performed

Then the QuadTree SHALL be queried using a search region defined as:

    searchRegion(P, eps) =
        [P.minX - eps, P.minY - eps, P.maxX + eps, P.maxY + eps]

And the QuadTree SHALL return a candidate set C where:

    ∀Q ∈ C: Q intersects searchRegion(P, eps)

Then the implementation SHALL filter C using the exact distance predicate:

    Neighbor(P, Q, eps) ⇔ distance(P, Q) <= eps

---

## A.6 Correctness Constraint

Given candidate set C returned from the QuadTree

When filtering is applied

Then the final neighborhood N(P) SHALL satisfy:

    N(P) = { Q ∈ B | distance(P, Q) <= eps }

And no valid neighbor SHALL be omitted

And no invalid neighbor SHALL be included

---

## A.7 Determinism

Given identical input B

When the QuadTree is constructed multiple times

Then insertion order SHALL NOT affect the result of neighborhood queries

And DBSCAN output SHALL remain deterministic

---

## A.8 Performance Expectation

Given a dataset of size N

When QuadTree is used

Then average neighborhood query complexity SHOULD be sub-linear relative to N

And worst-case degradation SHALL NOT affect correctness

---

## A.9 Encapsulation Requirement

The QuadTree SHALL be treated as an infrastructure component

And SHALL NOT:

- leak into domain-level clustering contracts
- modify bounding boxes
- introduce side effects visible outside clustering

The clustering algorithm SHALL depend only on an abstraction:

    INeighborhoodQuery

Where QuadTree is one implementation

---

## A.10 Replaceability

Given the abstraction INeighborhoodQuery

When an alternative spatial index is introduced (e.g., R-Tree)

Then DBSCAN SHALL function without modification

And all scenarios in the main specification SHALL still pass

End of Specification