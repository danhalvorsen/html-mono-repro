# plota.py
from __future__ import annotations

import json
from pathlib import Path

import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle

def main() -> None:
    script_dir = Path(__file__).resolve().parent
    input_path = script_dir / "fragments.json"
    output_path = script_dir / "fragments-plot.png"

    fragments = json.loads(input_path.read_text(encoding="utf-8"))

    fig, ax = plt.subplots(figsize=(14, 10))

    for index, fragment in enumerate(fragments):
        kind = fragment["kind"]
        box = fragment["boundingBox"]
        position = box["position"]

        x = float(position["x"])
        y = float(position["y"])
        width = float(box["width"])
        height = float(box["height"])

        center_x = x + width / 2.0
        center_y = y + height / 2.0

        if kind == "rectangle":
            ax.add_patch(
                Rectangle(
                    (x, y),
                    width,
                    height,
                    fill=False,
                    linewidth=1.5,
                )
            )

            ax.text(
                center_x,
                center_y,
                str(fragment.get("index", index)),
                ha="center",
                va="center",
                fontsize=8,
            )

        elif kind == "text":
            text = fragment.get("text", "")

            ax.scatter([center_x], [center_y], marker="x")

            ax.text(
                center_x,
                center_y,
                f'{fragment.get("index", index)}: {text}',
                ha="left",
                va="bottom",
                fontsize=8,
            )

            ax.add_patch(
                Rectangle(
                    (x, y),
                    width,
                    height,
                    fill=False,
                    linestyle="--",
                    linewidth=1.0,
                )
            )

    min_x = min(float(f["boundingBox"]["position"]["x"]) for f in fragments)
    min_y = min(float(f["boundingBox"]["position"]["y"]) for f in fragments)
    max_x = max(
        float(f["boundingBox"]["position"]["x"]) + float(f["boundingBox"]["width"])
        for f in fragments
    )
    max_y = max(
        float(f["boundingBox"]["position"]["y"]) + float(f["boundingBox"]["height"])
        for f in fragments
    )

    padding = 40

    ax.set_xlim(min_x - padding, max_x + padding)
    ax.set_ylim(max_y + padding, min_y - padding)  # PDF coordinate system
    ax.set_aspect("equal", adjustable="box")
    ax.grid(True)
    ax.set_title("PDF fragments")
    ax.set_xlabel("x")
    ax.set_ylabel("y")

    plt.tight_layout()
    plt.savefig(output_path, dpi=200)
    plt.show()

    print(f"Saved: {output_path}")

if __name__ == "__main__":
    main()