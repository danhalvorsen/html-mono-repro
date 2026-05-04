import { CompositeNode } from "@monorepo/core-composite-tree";
import { IndentedTreeFormatter } from "./presentation/IndentedTreeFormatter.js";
import { CompositeTreeJsonSerializer } from "./presentation/CompositeTreeJsonSerializer.js";
import { CompositeTreeYamlSerializer } from "./presentation/CompositeTreeYamlSerializer.js";

import { A } from "./domain/A.js";
import { B } from "./domain/B.js";
import { C } from "./domain/C.js";
import YAML from 'yaml';

const root = new CompositeNode();

const groupA = new CompositeNode();
groupA.add(new A());

const groupB = new CompositeNode();
groupB.add(new B());
groupB.add(new C());
groupB.add(new A());

const groupB1 = new CompositeNode();  
groupB1.add(new B());   
groupB.add(groupB1);

root.add(groupA);
root.add(groupB);

const formatter = new IndentedTreeFormatter();
const jsonSerializer = new CompositeTreeJsonSerializer();
const jsonResult = jsonSerializer.serialize(root);
console.log(jsonResult);

const yamlSerializer = new CompositeTreeYamlSerializer();
const yamlResult = yamlSerializer.serialize(root);
console.log(yamlResult);
