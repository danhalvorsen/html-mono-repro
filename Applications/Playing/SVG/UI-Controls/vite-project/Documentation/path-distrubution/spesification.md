Feature: Distribute SVG objects along a polygon path

  The system distributes SVG objects along an SVG polygon path.
  The polygon path may be open or closed.
  The feature is hosted inside a Lit 3 SVG template view.
  The object being distributed is always an SVG object.

  An SVG object may be:
  - an application-defined SVG object such as dual-sector-shape
  - an application-defined SVG object such as rectangle-shape
  - an existing reusable SVG object
  - an existing SVG object already present in the SVG scene and referenced as a source object

  The feature shall position repeated SVG object instances along the polygon path
  using arc-length distribution.
  The feature shall optionally rotate each distributed SVG object instance
  to align with the local tangent direction of the polygon path.

  ------------------------------------------------------------------------------------------------------------------

  Scenario: Distribute rectangle SVG objects on a closed polygon without rotation

    Given a closed polygon with points [(0,0), (100,0), (100,100), (0,100)]
    And the polygon is marked as closed
    And shapeCount is 4
    And rotateWithPath is false
    And the SVG object source is rectangle-shape

    When the distribution is executed

    Then the system shall compute the total polygon perimeter length
    And the system shall divide the perimeter into 4 equal arc-length intervals
    And the system shall compute 4 placement positions along the closed polygon path
    And the system shall render 4 SVG object instances
    And each rendered instance shall use rectangle-shape as its SVG object source
    And each rendered instance shall keep its default orientation

  ------------------------------------------------------------------------------------------------------------------

  Scenario: Distribute dual-sector SVG objects on a closed polygon with path alignment

    Given a closed polygon with points [(0,0), (100,0), (100,100), (0,100)]
    And the polygon is marked as closed
    And shapeCount is 4
    And rotateWithPath is true
    And the SVG object source is dual-sector-shape

    When the distribution is executed

    Then the system shall compute the total polygon perimeter length
    And the system shall divide the perimeter into 4 equal arc-length intervals
    And the system shall compute 4 placement positions along the closed polygon path
    And the system shall compute the local tangent direction at each placement position
    And the system shall render 4 SVG object instances
    And each rendered instance shall use dual-sector-shape as its SVG object source
    And each rendered instance shall be rotated to align with the local tangent direction

  ------------------------------------------------------------------------------------------------------------------

  Scenario: Distribute SVG objects on an open polygon path

    Given an open polygon with points [(0,0), (100,0), (150,50)]
    And the polygon is marked as open
    And shapeCount is 3
    And rotateWithPath is true
    And the SVG object source is rectangle-shape

    When the distribution is executed

    Then the system shall compute the total path length using connected segments only
    And the system shall not connect the last point back to the first point
    And the system shall compute 3 placement positions along the open polygon path
    And each placement position shall lie on the open polygon path
    And the system shall render 3 SVG object instances
    And each rendered instance shall be rotated according to the local tangent direction

  ------------------------------------------------------------------------------------------------------------------

  Scenario: Distribute existing reusable SVG objects

    Given an existing reusable SVG object is available
    And the SVG object source is marked as existing-svg-object
    And a polygon path is provided
    And shapeCount is 5
    And rotateWithPath is false

    When the distribution is executed

    Then the system shall use the existing reusable SVG object as the distribution source
    And the system shall not require rebuilding the SVG object as a new application-defined object
    And the system shall compute 5 placement positions along the polygon path
    And the system shall render 5 SVG object instances from the existing SVG object source
    And each rendered instance shall preserve the source SVG geometry
    And each rendered instance shall keep its default orientation

  ------------------------------------------------------------------------------------------------------------------

  Scenario: Distribute an SVG object already present in the SVG scene

    Given an SVG object already exists in the SVG scene
    And the SVG object can be referenced as a source object
    And a closed polygon path is provided
    And shapeCount is 6
    And rotateWithPath is true

    When the distribution is executed

    Then the system shall use the existing scene SVG object as the source object
    And the system shall create distributed SVG object instances from that source object
    And the original source SVG object shall remain unchanged
    And the distributed instances shall be positioned along the polygon path
    And the distributed instances shall be rotated using local path direction

  ------------------------------------------------------------------------------------------------------------------

  Scenario: Respect start and end offsets for SVG object distribution

    Given an open polygon with points [(0,0), (100,0)]
    And shapeCount is 3
    And startOffset is 10 units
    And endOffset is 10 units
    And the SVG object source is existing-svg-object

    When the distribution is executed

    Then the usable path length shall exclude the first 10 units
    And the usable path length shall exclude the last 10 units
    And the system shall compute placement positions only inside the reduced usable interval
    And no SVG object instance shall be rendered outside the offset bounds

  ------------------------------------------------------------------------------------------------------------------

  Scenario: Preserve deterministic SVG object distribution

    Given the same polygon input
    And the same SVG object source
    And the same distribution settings

    When the distribution is executed multiple times

    Then the computed placement positions shall be identical across executions
    And the computed rotation values shall be identical across executions
    And the rendered SVG object instances shall be deterministic across executions

  ------------------------------------------------------------------------------------------------------------------

  Scenario: Preserve spacing continuity across segment boundaries

    Given a polygon path with multiple segments of different lengths
    And shapeCount spans across one or more segment boundaries
    And the SVG object source is rectangle-shape

    When the distribution is executed

    Then placement shall continue by arc-length across segment boundaries
    And no duplicate placement shall occur at a segment junction
    And no unintended clustering shall occur at a segment boundary
    And the spacing between distributed SVG object instances shall remain continuous

  ------------------------------------------------------------------------------------------------------------------

  Scenario: Lit 3 SVG template integration for distributed SVG objects

    Given the feature is hosted inside a Lit 3 SVG template view
    And the SVG object source is provided
    And a polygon path is provided

    When the Lit 3 view renders

    Then the distribution logic shall produce SVG template output for each placement
    And each placement shall render a transformed SVG object instance
    And the final output shall be composed as a single Lit 3 SVG template
    And no imperative DOM mutation shall be required for the distribution feature

  ------------------------------------------------------------------------------------------------------------------

  Scenario: Keep the source SVG object separate from distributed instances

    Given an SVG object is used as the source object
    And the distribution feature renders multiple instances from that source

    When the distribution is executed

    Then the source SVG object shall not be mutated
    And translation shall belong to each distributed instance
    And rotation shall belong to each distributed instance
    And the source SVG object shall remain reusable for later distributions
