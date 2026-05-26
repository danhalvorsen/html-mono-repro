Feature: A* pathfinding
  As a pathfinding engine
  I want to compute optimal paths on a grid
  So that agents can move efficiently between points

  Background:
    Given a grid of size 5 by 5
    And all cells are walkable

  Scenario: Find a straight-line path with no obstacles
    Given the start node is at (0, 0)
    And the goal node is at (4, 0)
    When I run A* search
    Then a path should be found
    And the path length should be 5
    And the path should be:
      | x | y |
      | 0 | 0 |
      | 1 | 0 |
      | 2 | 0 |
      | 3 | 0 |
      | 4 | 0 |

  Scenario: Find a shortest path around a single obstacle
    Given the start node is at (0, 0)
    And the goal node is at (2, 0)
    And the following cells are blocked:
      | x | y |
      | 1 | 0 |
    When I run A* search
    Then a path should be found
    And the path length should be 5
    And the path should be:
      | x | y |
      | 0 | 0 |
      | 0 | 1 |
      | 1 | 1 |
      | 2 | 1 |
      | 2 | 0 |

  Scenario: No path when goal is completely enclosed
    Given the start node is at (0, 0)
    And the goal node is at (2, 2)
    And the following cells are blocked:
      | x | y |
      | 1 | 2 |
      | 2 | 1 |
      | 3 | 2 |
      | 2 | 3 |
    When I run A* search
    Then no path should be found

  Scenario: Heuristic never overestimates true cost
    Given a Manhattan distance heuristic
    And uniform movement cost of 1 per step
    When I compute the heuristic from (0, 0) to (3, 4)
    Then the heuristic value should be 7
    And the optimal path cost should be greater than or equal to 7

  Scenario: A* expands fewer nodes than Dijkstra on same grid
    Given a grid of size 20 by 20
    And random obstacles with density 20 percent
    And the start node is at (0, 0)
    And the goal node is at (19, 19)
    When I run Dijkstra search
    And I record the number of expanded nodes
    And I run A* search with an admissible heuristic
    Then A* should expand fewer nodes than Dijkstra

  Scenario: Immediate completion when start equals goal
    Given a grid of size 5 by 5
    And all cells are walkable
    And the start node is at (2, 2)
    And the goal node is at (2, 2)
    When I run A* search
    Then a path should be found
    And the path length should be 1
    And the path should be:
      | x | y |
      | 2 | 2 |

  Scenario: Reject out-of-bounds start node
    Given a grid of size 5 by 5
    And all cells are walkable
    And the start node is at (-1, 0)
    And the goal node is at (4, 4)
    When I run A* search
    Then the request should be rejected with an out-of-bounds error

  Scenario: Reject out-of-bounds goal node
    Given a grid of size 5 by 5
    And all cells are walkable
    And the start node is at (0, 0)
    And the goal node is at (5, 4)
    When I run A* search
    Then the request should be rejected with an out-of-bounds error

  Scenario: Reject blocked start node
    Given a grid of size 5 by 5
    And the following cells are blocked:
      | x | y |
      | 0 | 0 |
    And the start node is at (0, 0)
    And the goal node is at (4, 4)
    When I run A* search
    Then the request should be rejected because start or goal is blocked

  Scenario: Reject blocked goal node
    Given a grid of size 5 by 5
    And the following cells are blocked:
      | x | y |
      | 4 | 4 |
    And the start node is at (0, 0)
    And the goal node is at (4, 4)
    When I run A* search
    Then the request should be rejected because start or goal is blocked

  Scenario: Four-way movement does not allow diagonal shortcuts
    Given a grid of size 3 by 3
    And all cells are walkable
    And movement mode is four-way
    And the start node is at (0, 0)
    And the goal node is at (1, 1)
    When I run A* search
    Then a path should be found
    And the path length should be 3

  Scenario: Eight-way movement allows a direct diagonal step
    Given a grid of size 3 by 3
    And all cells are walkable
    And movement mode is eight-way
    And corner cutting is enabled
    And the start node is at (0, 0)
    And the goal node is at (1, 1)
    When I run A* search
    Then a path should be found
    And the path length should be 2

  Scenario: Eight-way movement blocks corner cutting when disabled
    Given a grid of size 3 by 3
    And movement mode is eight-way
    And corner cutting is disabled
    And the following cells are blocked:
      | x | y |
      | 0 | 1 |
      | 1 | 0 |
    And the start node is at (0, 0)
    And the goal node is at (1, 1)
    When I run A* search
    Then no path should be found

  Scenario: Deterministic tie-breaking returns stable path
    Given a grid of size 5 by 5
    And all cells are walkable
    And the start node is at (0, 0)
    And the goal node is at (4, 4)
    And deterministic tie-breaking is configured
    When I run A* search 3 times with the same inputs
    Then each run should return the same path

  Scenario: Prefer lower total traversal cost over fewer steps
    Given a grid of size 5 by 3
    And weighted traversal costs are enabled
    And all cells have cost 1
    And cell (2, 1) has traversal cost 50
    And the start node is at (0, 1)
    And the goal node is at (4, 1)
    When I run A* search
    Then a path should be found
    And the chosen path should avoid cell (2, 1)
    And the total path cost should be less than 54

  Scenario: Known map optimality with exact cost assertion
    Given a grid of size 6 by 6
    And the following cells are blocked:
      | x | y |
      | 1 | 1 |
      | 1 | 2 |
      | 1 | 3 |
      | 3 | 2 |
      | 4 | 2 |
    And the start node is at (0, 0)
    And the goal node is at (5, 5)
    When I run A* search
    Then a path should be found
    And the optimal path cost should be exactly 10

  Scenario: No path in a disconnected-map partition
    Given a grid of size 6 by 6
    And the following cells are blocked:
      | x | y |
      | 3 | 0 |
      | 3 | 1 |
      | 3 | 2 |
      | 3 | 3 |
      | 3 | 4 |
      | 3 | 5 |
    And the start node is at (1, 2)
    And the goal node is at (5, 2)
    When I run A* search
    Then no path should be found

  Scenario: Large grid run stays within expansion and runtime limits
    Given a grid of size 100 by 100
    And random obstacles with density 15 percent
    And the start node is at (0, 0)
    And the goal node is at (99, 99)
    And a fixed random seed of 42
    When I run A* search
    Then execution time should be below 200 milliseconds
    And expanded nodes should be below 5000
