import { ElementVNode, InsertHook, Module, VNode } from './';

import { AttributesModule } from './modules/attributes';
import { FocusModule } from './modules/focus';
import { ModuleCallbacks } from './modules/ModuleCallbacks';
import { PropsModule } from './modules/props';
import { StylesModule } from './modules/styles';
import { createElement } from './createElement';
import { patchVNode } from './patchVNode';
import { removeVNodes } from './removeVNodes';
import { vNodesAreEqual } from './helpers';

export function init (modules: Array<Module>) {
  const attributesModule = new AttributesModule();
  const propsModule = new PropsModule();
  const stylesModule = new StylesModule();
  const focusModule = new FocusModule();

  const defaultModules =
    [
      attributesModule,
      propsModule,
      stylesModule,
      focusModule,
    ];

  const moduleCallbacks = new ModuleCallbacks(defaultModules.concat(modules));

  return function patch (formerVNode: ElementVNode, vNode: VNode): ElementVNode {
    const insertedVNodeQueue: Array<ElementVNode> = [];

    moduleCallbacks.pre(vNode);

    if (vNodesAreEqual(formerVNode, vNode))
      patchVNode(formerVNode, vNode, moduleCallbacks, insertedVNodeQueue);
    else {
      const element = formerVNode.element;
      const parentNode = element.parentNode;

      vNode = createElement(vNode, moduleCallbacks, insertedVNodeQueue) as ElementVNode;

      if (parentNode) {
        parentNode.insertBefore(vNode.element as Element, element.nextSibling);
        removeVNodes(parentNode, [formerVNode], 0, 0, moduleCallbacks);
      }
    }

    for (let i = 0; i < insertedVNodeQueue.length; ++i)
      (insertedVNodeQueue[i].props.insert as InsertHook)(insertedVNodeQueue[i]);

    moduleCallbacks.post(vNode as ElementVNode);

    return vNode as ElementVNode;
  };
}
