import { useEditor, EditorContent } from "@tiptap/react";
import Link from "@tiptap/extension-link";
import Code from "@tiptap/extension-code";
import Text from "@tiptap/extension-text";
import Paragraph from "@tiptap/extension-paragraph";
import Document from "@tiptap/extension-document";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import Placeholder from "@tiptap/extension-placeholder";
import type { ReactNode } from "react";
import { Fragment, useCallback } from "react";
import type { FieldErrorsImpl } from "react-hook-form";
import FieldLabel from "../../StrongText";
import type { Editor } from "@tiptap/core";
import Collaboration from "@tiptap/extension-collaboration";
import * as Y from "yjs";
import Highlight from "@tiptap/extension-highlight";
import {
  BoldIcon,
  Code2,
  CodeIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  HighlighterIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListMinus,
  ListMinusIcon,
  ListOrderedIcon,
  PilcrowIcon,
  RedoIcon,
  UndoIcon,
} from "lucide-react";
import { ClientEventInput } from "src/types";

type handleChangeType = (e: any) => void;

export const RichTextArea = ({
  name,
  handleChange,
  errors,
  fieldName,
  infoText,
  value,
}: {
  name: keyof ClientEventInput;
  fieldName?: string;
  infoText?: string;
  handleChange: handleChangeType;
  errors?: Partial<FieldErrorsImpl<ClientEventInput>>;
  value?: string;
}) => {
  const isError = errors && errors[name];

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Code,
      Bold,
      Italic,
      Link.configure({
        openOnClick: false,
      }),
      Heading.configure({
        levels: [1, 2, 3],
      }),
      BulletList,
      OrderedList,
      ListItem,
      Placeholder.configure({
        placeholder: "Write away!",
        showOnlyWhenEditable: true,
      }),
      Collaboration.configure({
        document: new Y.Doc(),
      }),
      Highlight,
    ],
    editorProps: {
      attributes: {
        class: `text-primary dark:text-primary-dark dark:prose-invert prose focus:outline-none prose-stone`,
      },
    },
    onUpdate: ({ editor }) => handleChange(editor.getHTML()),
    content: value,
  });
  return (
    <div>
      {fieldName && (
        <FieldLabel styles="my-auto">
          {fieldName}
          <div className="font-primary text-sm font-light lowercase">
            {infoText}
          </div>
        </FieldLabel>
      )}
      <div className="rounded-lg border-2 border-primary p-3 dark:border-primary-dark">
        {editor && <MenuBar editor={editor} />}
        <EditorContent editor={editor} />
      </div>
      <div className="font-primary text-sm lowercase text-red-400">
        {/*
        if errors is defined and error for this field is set, then display message, otherwise null
      */}
        {isError ? errors[name]?.message : null}
      </div>
    </div>
  );
};

const iconStyle = "w-5 h-5";
export const MenuBar = ({ editor }: { editor: Editor }) => {
  const items = [
    {
      icon: <BoldIcon className={`${iconStyle}`} />,
      title: "Bold",
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: () => editor.isActive("bold"),
    },
    {
      icon: <ItalicIcon className={`${iconStyle}`} />,
      title: "Italic",
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: () => editor.isActive("italic"),
    },
    {
      icon: <CodeIcon className={`${iconStyle}`} />,
      title: "Code",
      action: () => editor.chain().focus().toggleCode().run(),
      isActive: () => editor.isActive("code"),
    },
    // {
    //   icon: <HighlighterIcon />,
    //   title: "Highlight",
    //   action: () => editor.chain().focus().toggleHighlight().run(),
    //   isActive: () => editor.isActive("highlight"),
    // },
    {
      icon: <Heading1Icon className={`${iconStyle}`} />,
      title: "Heading 1",
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: () => editor.isActive("heading", { level: 1 }),
    },
    {
      icon: <Heading2Icon className={`${iconStyle}`} />,
      title: "Heading 2",
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: () => editor.isActive("heading", { level: 2 }),
    },
    {
      icon: <Heading3Icon className={`${iconStyle}`} />,
      title: "Heading 3",
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: () => editor.isActive("heading", { level: 3 }),
    },
    {
      icon: <LinkIcon className={`${iconStyle}`} />,
      title: "Link",
      action: useCallback(() => {
        const previousUrl = editor.getAttributes("link").href;
        const url = window.prompt("URL", previousUrl);

        // cancelled
        if (url === null) {
          return;
        }

        // empty
        if (url === "") {
          editor.chain().focus().extendMarkRange("link").unsetLink().run();

          return;
        }

        // update link
        editor
          .chain()
          .focus()
          .extendMarkRange("link")
          .setLink({ href: url })
          .run();
      }, [editor]),
      isActive: () => editor.isActive("link"),
    },
    {
      icon: <ListIcon className={`${iconStyle}`} />,
      title: "Bullet List",
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: () => editor.isActive("bulletList"),
    },
    {
      icon: <ListOrderedIcon className={`${iconStyle}`} />,
      title: "Ordered List",
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: () => editor.isActive("orderedList"),
    },
    {
      icon: <UndoIcon className={`${iconStyle}`} />,
      title: "Undo",
      action: () => editor.chain().focus().undo().run(),
    },
    {
      icon: <RedoIcon className={`${iconStyle}`} />,
      title: "Redo",
      action: () => editor.chain().focus().redo().run(),
    },
  ];

  return (
    <div className="flex flex-row flex-wrap items-center gap-3">
      {items.map((item, index) => (
        <Fragment key={index}>
          <MenuItem {...item} />
        </Fragment>
      ))}
    </div>
  );
};

const MenuItem = ({
  icon,
  title,
  action,
  isActive = null,
}: {
  icon?: ReactNode;
  title?: string;
  action?: () => void;
  isActive?: (() => boolean) | null;
}) => (
  <span
    // className={`menu-item${isActive && isActive() ? " is-active" : ""}`}
    className={
      `${
        isActive && isActive()
          ? "bg-primary text-primary-muted dark:bg-fill-dark dark:text-primary-muted"
          : "bg-white text-primary dark:bg-black dark:text-primary-dark"
      }` +
      ` inline-flex cursor-pointer flex-row items-center gap-2 rounded-lg border-2 border-gray-800 px-2 font-secondary text-xs uppercase`
    }
    onClick={action}
    title={title}
  >
    {icon}
  </span>
);
