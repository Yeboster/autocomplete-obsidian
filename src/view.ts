import { Editor } from "codemirror";
import { Completion } from "./core";
import { appendWidget, generateView } from "./helpers/view";
class View {
  private view: HTMLElement;

  public isShown(): boolean {
    return this.view != null;
  }

  public show(editor: Editor, results: Completion[]) {
    if (this.isShown()) this.remove(editor);

    // TODO: add keymaps
    // TODO: add click listener
    this.view = generateView(results, 0);
    appendWidget(editor, this.view);
  }

  public remove(editor: Editor) {
    if (!this.isShown()) return;

    // TODO: remove keymaps
    // TODO: remove click listener

    try {
      const parentNode = this.view.parentNode;
      if (parentNode) {
        const removed = parentNode.removeChild(this.view);
        if (removed) this.view = null;
      }
    } catch (e) {
      console.error(`Cannot destroy view. Reason: ${e}`);
    }
  }
}

export default View;