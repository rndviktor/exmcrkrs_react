import {EditorContent, EditorContext, useEditor} from "@tiptap/react";
import {useEffect, useMemo, useState} from "react";
import {
    Check,
    Edit,
    CircleX,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Highlighter,
    TextAlignStart, TextAlignCenter, TextAlignEnd
} from "lucide-react";

import Highlight from '@tiptap/extension-highlight'
import {TextStyleKit} from "@tiptap/extension-text-style";
import TextAlign from '@tiptap/extension-text-align'
import StarterKit from "@tiptap/starter-kit";
import Image from '@tiptap/extension-image'


export default function QuestionContentEditor({ content, createNew, onSubmit }:{content: string|null, createNew: boolean, onSubmit?: (data: string) => void }) {
    const [, setTick] = useState(0);
    
    const editor = useEditor({
        extensions: [TextStyleKit, StarterKit, Highlight,
            Image.configure({
                inline: true,
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
                alignments: ['left', 'center', 'right', 'justify'],
                defaultAlignment: 'left',
            }),
        ],
        editable: createNew,
        onUpdate: () => setTick(tick => tick + 1),
        onSelectionUpdate: () => setTick(tick => tick + 1),
    });

    if (!editor) {
        return null;
    }

    useEffect(() => {
        editor.commands.setContent(content)
    }, [content, editor]);
    
    const providerValue = useMemo(() => ({editor}), [editor]);
    
    const [edit, setEdit] = useState(false)
    
    const handleSubmit = (_: any) => {
        if (onSubmit) {
            onSubmit(editor.getHTML() as string);
            setEdit(false);
            editor.setEditable(false);
        }
    }
    
    const handleEditToggle = (toggle: boolean) => {
        if (edit && !toggle) {
            editor.commands.setContent(content)
        }
        setEdit(toggle)
        editor.setEditable(toggle)
    }

    const toggle = (command: any) => {
        command.focus().run();
    };

    const isActive = (name: string, attributes?: Record<string, any>) =>
        editor.isActive(name, attributes)
            ? 'bg-gray-700 text-cyan-400'
            : 'text-gray-600 hover:bg-gray-700';
    
    return (<EditorContext.Provider value={providerValue}>
        <div className="flex flex-1 items-center gap-1 border-b p-1 bg-cyan-700 rounded-t-md ">
            {!createNew && !editor.isEditable && (<>
                <div></div>
                <button id="contentEdit" onClick={() => handleEditToggle(true)}>
                    <Edit size={12}/>
                </button>
            </>)}
            {editor.isEditable && (<>
                <div className="flex items-center gap-1 border-r px-5">
                    <button
                        onClick={() => toggle(editor.chain().toggleBold())}
                        className={`p-2 rounded transition-all ${isActive('bold')}`}
                    >
                        <Bold size={10} />
                    </button>

                    <button
                        onClick={() => toggle(editor.chain().toggleItalic())}
                        className={`p-2 rounded transition-all ${isActive('italic')}`}
                    >
                        <Italic size={10} />
                    </button>

                    <button
                        onClick={() => toggle(editor.chain().toggleUnderline())}
                        className={`p-2 rounded transition-all ${isActive('underline')}`}
                    >
                        <Underline size={10} />
                    </button>

                    <button
                        onClick={() => toggle(editor.chain().toggleStrike())}
                        className={`p-2 rounded transition-all ${isActive('strike')}`}
                    >
                        <Strikethrough size={10} />
                    </button>
                </div>

                <div className="flex items-center gap-1 border-r px-5">
                    <button
                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
                        className={`p-2 rounded transition-all ${isActive('textAlign', { textAlign: 'left' })}`}
                    >
                        <TextAlignStart size={10} />
                    </button>

                    <button
                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
                        className={`p-2 rounded transition-all ${isActive('textAlign', { textAlign: 'center' })}`}
                    >
                        <TextAlignCenter size={10} />
                    </button>

                    <button
                        onClick={() => editor.chain().focus().setTextAlign('right').run()}
                        className={`p-2 rounded transition-all ${isActive('textAlign', { textAlign: 'right' })}`}
                    >
                        <TextAlignEnd size={10} />
                    </button>
                </div>
                
                <div className="flex items-center gap-1 border-r px-5">
                    <button
                        onClick={() => toggle((editor.chain() as any).toggleHighlight())}
                        className={`p-2 rounded transition-all ${isActive('highlight')}`}
                        title="Highlight"
                    >
                        <Highlighter size={10} />
                    </button>
                </div>
                
                <div className="gap-1">
                    <button id="questionContentSubmit" onClick={(e) => handleSubmit(e)}>
                        <Check size={12}/>
                    </button>
                    <button onClick={() => handleEditToggle(false)}>
                        <CircleX size={12}/>
                    </button>
                </div>
                
            </>)}
        </div>
        <EditorContent editor={editor} className="whitespace-pre-line border-b-2 border-t-4 border-t-cyan-600 flex-1"/>
    </EditorContext.Provider>)
}