I want a threejs Rect builder that build a Rect 1x1 in xy plane. The Rect have a sematic model given top botton left and right. Each for them them with start mid end sematic as well.   
The RectBuilder should understand the semantic and have rules: 
- Add() means add a new Rect with a center of (0,0) and size of (1,1,1) to the group.
- Add().Right() means add a new Rect with its left edge sharing the left neiborung right    edge. Sharing is important here, so we avoid flicking and z-fighting.
- Add().Left() means add a new Rect with its right edge sharing the right neiborung left edge.
- Add().Top() means add a new Rect with its bottom edge sharing the bottom neibor   
    boring top edge.
- Add().Bottom() means add a new Rect with its top edge sharing the top neibor  
    boring bottom edge.

- Add().Left().Left() means add a new Rect with its right edge sharing the right neiborung left edge, and its left edge sharing the left neiborung right edge. This is for building a row of Rects. 
- Add().Top().Top() means add a new Rect with its bottom edge sharing the bottom neiborung top edge, and its top edge sharing the top neiborung bottom edge. This is for building a column of Rects.                    
- Add().Left().Top() means add a new Rect with its right edge sharing the right neiborung left edge, and its bottom edge sharing the bottom neiborung top edge. This is for building a grid of Rects.               
- Add().Right().Top() means add a new Rect with its left edge sharing the left neiborung right edge, and its bottom edge sharing the bottom neiborung top edge. This is for building a grid of Rects.                           
- Add().Right().Right().Rotate(Sematic.TopLef, 45) means rotate the last Rect(45) degree clockwise. That means that the left neibors  rigth.bottom vertice must be move to the new Rect left.Bottom vertice. 
