/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { ChildNodeSpecificationTypes, RelationshipDirection, Ruleset, RuleTypes } from "@itwin/presentation-common";

const ruleset: Ruleset = {
  id: "TreeHierarchy",
  requiredSchemas: [
    {
      name: "ProcessFunctional",
    },
  ],
  rules: [
    {
      ruleType: RuleTypes.RootNodes, // "RootNodes"
      specifications: [
        {
          specType: ChildNodeSpecificationTypes.InstanceNodesOfSpecificClasses, // "InstanceNodesOfSpecificClasses"
          classes: [
            {
              schemaName: "ProcessFunctional",
              classNames: [
                "PLANT_AREA", "UNIT"
              ],
            },
          ],
          arePolymorphic: true,
          groupByClass: true,
          groupByLabel: false,
        },
      ],
    },
    {
      ruleType: RuleTypes.ChildNodes, // "ChildNodes"
      specifications: [
        {
          specType: ChildNodeSpecificationTypes.RelatedInstanceNodes, // "RelatedInstanceNodes"
          relationshipPaths: [
            {
              relationship: {
                schemaName: "BisCore",
                className: "ElementRefersToElements",
              },
              direction: RelationshipDirection.Forward // "Forward"
            },
          ],
          groupByClass: false,
          groupByLabel: false,
        },
      ],
    }
  ],
};

export default ruleset;
