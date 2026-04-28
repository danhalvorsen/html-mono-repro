# add-champions-league-jgf-dataset.ps1
# Run from repo root, parent folder, or application-graph-visualisation-new.
# No backup files. Use git rollback.

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Find-GitRoot {
    $current = (Resolve-Path ".").Path

    while ($true) {
        if (Test-Path (Join-Path $current ".git")) {
            return $current
        }

        $parent = Split-Path $current -Parent

        if ($parent -eq $current) {
            throw "Could not find git root from '$((Resolve-Path '.').Path)'."
        }

        $current = $parent
    }
}

function Write-Utf8NoBom {
    param(
        [Parameter(Mandatory = $true)]
        [string] $Path,

        [Parameter(Mandatory = $true)]
        [string] $Content
    )

    $directory = Split-Path $Path -Parent

    if (-not (Test-Path $directory)) {
        New-Item -ItemType Directory -Path $directory | Out-Null
    }

    $encoding = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($Path, $Content, $encoding)
}

function Read-Text {
    param(
        [Parameter(Mandatory = $true)]
        [string] $Path
    )

    if (-not (Test-Path $Path)) {
        throw "Missing file: $Path"
    }

    return [System.IO.File]::ReadAllText($Path)
}

$repoRoot = Find-GitRoot
$moduleRoot = Join-Path $repoRoot "packages/core-graph-visualisation-modules/application-graph-visualisation-new"

if (-not (Test-Path $moduleRoot)) {
    throw "Missing module: $moduleRoot"
}

Write-Host "Repo:   $repoRoot"
Write-Host "Module: $moduleRoot"
Write-Host ""

# ---------------------------------------------------------------------------
# 1. Add JGF dataset.
# ---------------------------------------------------------------------------

Write-Utf8NoBom `
    -Path (Join-Path $moduleRoot "src/data/graphs/champions-league-players.jgf.json") `
    -Content @'
{
  "graph": {
    "id": "champions-league-players",
    "metadata": {
      "label": "UEFA Champions League Players",
      "version": "1.0",
      "description": "Sample JGF graph connecting Champions League teams, players, and player nationalities."
    },
    "nodes": [
      {
        "id": "UEFA Champions League",
        "metadata": {
          "label": "UEFA Champions League",
          "kind": "competition"
        }
      },
      {
        "id": "Manchester City",
        "metadata": {
          "label": "Manchester City",
          "kind": "team",
          "country": "England"
        }
      },
      {
        "id": "Real Madrid",
        "metadata": {
          "label": "Real Madrid",
          "kind": "team",
          "country": "Spain"
        }
      },
      {
        "id": "FC Barcelona",
        "metadata": {
          "label": "FC Barcelona",
          "kind": "team",
          "country": "Spain"
        }
      },
      {
        "id": "FC Bayern Munich",
        "metadata": {
          "label": "FC Bayern Munich",
          "kind": "team",
          "country": "Germany"
        }
      },
      {
        "id": "Erling Haaland",
        "metadata": {
          "label": "Erling Haaland",
          "kind": "player",
          "position": "forward"
        }
      },
      {
        "id": "Kylian Mbappé",
        "metadata": {
          "label": "Kylian Mbappé",
          "kind": "player",
          "position": "forward"
        }
      },
      {
        "id": "Lamine Yamal",
        "metadata": {
          "label": "Lamine Yamal",
          "kind": "player",
          "position": "forward"
        }
      },
      {
        "id": "Harry Kane",
        "metadata": {
          "label": "Harry Kane",
          "kind": "player",
          "position": "forward"
        }
      },
      {
        "id": "Norway",
        "metadata": {
          "label": "Norway",
          "kind": "nationality"
        }
      },
      {
        "id": "France",
        "metadata": {
          "label": "France",
          "kind": "nationality"
        }
      },
      {
        "id": "Spain",
        "metadata": {
          "label": "Spain",
          "kind": "nationality"
        }
      },
      {
        "id": "England",
        "metadata": {
          "label": "England",
          "kind": "nationality"
        }
      }
    ],
    "edges": [
      {
        "id": "competition-team-manchester-city",
        "source": "UEFA Champions League",
        "target": "Manchester City",
        "metadata": {
          "label": "includes team",
          "relation": "includes-team"
        }
      },
      {
        "id": "competition-team-real-madrid",
        "source": "UEFA Champions League",
        "target": "Real Madrid",
        "metadata": {
          "label": "includes team",
          "relation": "includes-team"
        }
      },
      {
        "id": "competition-team-fc-barcelona",
        "source": "UEFA Champions League",
        "target": "FC Barcelona",
        "metadata": {
          "label": "includes team",
          "relation": "includes-team"
        }
      },
      {
        "id": "competition-team-fc-bayern-munich",
        "source": "UEFA Champions League",
        "target": "FC Bayern Munich",
        "metadata": {
          "label": "includes team",
          "relation": "includes-team"
        }
      },
      {
        "id": "team-player-erling-haaland",
        "source": "Manchester City",
        "target": "Erling Haaland",
        "metadata": {
          "label": "has player",
          "relation": "has-player"
        }
      },
      {
        "id": "player-nationality-erling-haaland-norway",
        "source": "Erling Haaland",
        "target": "Norway",
        "metadata": {
          "label": "nationality",
          "relation": "has-nationality"
        }
      },
      {
        "id": "team-player-kylian-mbappe",
        "source": "Real Madrid",
        "target": "Kylian Mbappé",
        "metadata": {
          "label": "has player",
          "relation": "has-player"
        }
      },
      {
        "id": "player-nationality-kylian-mbappe-france",
        "source": "Kylian Mbappé",
        "target": "France",
        "metadata": {
          "label": "nationality",
          "relation": "has-nationality"
        }
      },
      {
        "id": "team-player-lamine-yamal",
        "source": "FC Barcelona",
        "target": "Lamine Yamal",
        "metadata": {
          "label": "has player",
          "relation": "has-player"
        }
      },
      {
        "id": "player-nationality-lamine-yamal-spain",
        "source": "Lamine Yamal",
        "target": "Spain",
        "metadata": {
          "label": "nationality",
          "relation": "has-nationality"
        }
      },
      {
        "id": "team-player-harry-kane",
        "source": "FC Bayern Munich",
        "target": "Harry Kane",
        "metadata": {
          "label": "has player",
          "relation": "has-player"
        }
      },
      {
        "id": "player-nationality-harry-kane-england",
        "source": "Harry Kane",
        "target": "England",
        "metadata": {
          "label": "nationality",
          "relation": "has-nationality"
        }
      }
    ]
  }
}
'@

# ---------------------------------------------------------------------------
# 2. Replace ApplicationGraphFactory with JGF-aware factory.
# ---------------------------------------------------------------------------

Write-Utf8NoBom `
    -Path (Join-Path $moduleRoot "src/app/ApplicationGraphFactory.ts") `
    -Content @'
import { DagGraph, type IDagGraph } from "@monorepo/core-graph";
import { GraphJsonDeserializer } from "@monorepo/core-graph-json";
import domainGraphData from "../data/graphs/domain-graph.json";
import webComponentHierarchyGraphData from "../data/graphs/web-component-hierarchy-graph.json";
import reactiveControllerOwnershipGraphData from "../data/graphs/reactive-controller-ownership-graph.json";
import applicationArchitectureGraphData from "../data/graphs/application-architecture-graph.json";
import hierarchicalOrganizationGraphData from "../data/graphs/hierarchical-organization-graph.json";
import championsLeaguePlayersGraphData from "../data/graphs/champions-league-players.jgf.json";

interface JgfGraphData {
  readonly graph: {
    readonly nodes: readonly JgfNodeData[];
    readonly edges: readonly JgfEdgeData[];
  };
}

interface JgfNodeData {
  readonly id: string;
  readonly metadata?: unknown;
}

interface JgfEdgeData {
  readonly source: string;
  readonly target: string;
}

interface GraphJsonData {
  readonly nodes: readonly {
    readonly id: string;
    readonly payload: unknown;
  }[];
  readonly edges: readonly {
    readonly sourceId: string;
    readonly targetId: string;
  }[];
}

export interface IApplicationGraphFactory {
  createDomainGraph(): IDagGraph;
  createWebComponentHierarchyGraph(): IDagGraph;
  createReactiveControllerOwnershipGraph(): IDagGraph;
  createApplicationArchitectureGraph(): IDagGraph;
  createHierarchicalOrganizationGraph(): IDagGraph;
  createChampionsLeaguePlayersGraph(): IDagGraph;
  createGraph(): IDagGraph;
}

export class ApplicationGraphFactory implements IApplicationGraphFactory {
  private readonly deserializer: GraphJsonDeserializer;

  constructor() {
    this.deserializer = new GraphJsonDeserializer(() => new DagGraph());
  }

  createDomainGraph(): IDagGraph {
    return this.deserializeGraphJson(domainGraphData);
  }

  createWebComponentHierarchyGraph(): IDagGraph {
    return this.deserializeGraphJson(webComponentHierarchyGraphData);
  }

  createReactiveControllerOwnershipGraph(): IDagGraph {
    return this.deserializeGraphJson(reactiveControllerOwnershipGraphData);
  }

  createApplicationArchitectureGraph(): IDagGraph {
    return this.deserializeGraphJson(applicationArchitectureGraphData);
  }

  createHierarchicalOrganizationGraph(): IDagGraph {
    return this.deserializeGraphJson(hierarchicalOrganizationGraphData);
  }

  createChampionsLeaguePlayersGraph(): IDagGraph {
    return this.deserializeGraphJson(this.toGraphJson(championsLeaguePlayersGraphData));
  }

  createGraph(): IDagGraph {
    return this.createDomainGraph();
  }

  private deserializeGraphJson(graphData: GraphJsonData): IDagGraph {
    return this.deserializer.deserialize(JSON.stringify(graphData)) as IDagGraph;
  }

  private toGraphJson(jgfData: JgfGraphData): GraphJsonData {
    return {
      nodes: jgfData.graph.nodes.map((node) => ({
        id: node.id,
        payload: node.metadata ?? null,
      })),
      edges: jgfData.graph.edges.map((edge) => ({
        sourceId: edge.source,
        targetId: edge.target,
      })),
    };
  }
}
'@

# ---------------------------------------------------------------------------
# 3. Add source graph id.
# ---------------------------------------------------------------------------

Write-Utf8NoBom `
    -Path (Join-Path $moduleRoot "src/app/GraphVisualizationSourceGraphTypes.ts") `
    -Content @'
export type SourceGraphId =
  | "domain"
  | "web-component-hierarchy"
  | "reactive-controller-ownership"
  | "application-architecture"
  | "hierarchical-organization"
  | "champions-league-players";

export interface SourceGraphOption {
  readonly id: SourceGraphId;
  readonly label: string;
}
'@

# ---------------------------------------------------------------------------
# 4. Patch AppView1 source selector.
# ---------------------------------------------------------------------------

$appViewPath = Join-Path $moduleRoot "src/views/AppView1/AppView1.ts"
$appView = Read-Text $appViewPath

if ($appView -notmatch 'champions-league-players') {
    $appView = $appView -replace `
        '\{ id: "hierarchical-organization", label: "Hierarchical Organization" \},', `
        '{ id: "hierarchical-organization", label: "Hierarchical Organization" },
        { id: "champions-league-players", label: "Champions League Players" },'

    $appView = $appView -replace `
        'case "hierarchical-organization":\r?\n\s+return this\.graphFactory\.createHierarchicalOrganizationGraph\(\);', `
        'case "hierarchical-organization":
                return this.graphFactory.createHierarchicalOrganizationGraph();
            case "champions-league-players":
                return this.graphFactory.createChampionsLeaguePlayersGraph();'
}

Write-Utf8NoBom -Path $appViewPath -Content $appView

# ---------------------------------------------------------------------------
# 5. Build.
# ---------------------------------------------------------------------------

Push-Location $moduleRoot
try {
    pnpm build
}
finally {
    Pop-Location
}

Write-Host ""
Write-Host "Changed files:"
git -C $repoRoot status --short -- $moduleRoot