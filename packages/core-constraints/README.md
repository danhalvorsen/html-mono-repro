What is the definition of layout? How is it categorised? And for 2D and 3D, what elements must be present as layout for being able to render visual elements (Shap)? and layout, or perhaps we can use the word constraints.

Great! So, I'm thinking I will make a core layout.abstract core-layout.2D.abstract core-layout.3D.abstract and core-layout.2D.SVG and core-layout.3D.ThreeJS. All concrete implementations have a coordinate system; I want to normalise that to a Cartesian system. 3D have also often a concept of world and local syustems, I will sopport that. I want an options when drawing a composistion model (composite three) I think I want to use a Stach for pushing local and world coordiate systems for 3D and same for 2D but here we have one represetation) But still drawing a box penUp().Goto(0,0).Line(1,0).Push().Line(1,1).Push().Line(-1,0).Push().Line(0,-1).Render() I dont know the same of this, but is use by turtle and aavaiable in HTML5

core-rule.abstract 
core-rule.2D 
core-rule.3D 
(Rule for supporort for contraints)

core-constraints.abstract.2D
core-constraints.abstract.3D
core-constraints.Svg.2D 
core-constraints.ThreeJS.3D 

core-composition-abstract
core-composition-svg
core-composition-threeJs

core-shape.abstract 
core-shape.ThreeJS
core-shape.SVG.2D
