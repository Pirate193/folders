'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TaskItem, TaskList } from '@tiptap/extension-list'
import { TableKit } from '@tiptap/extension-table'
import { useEditorStore } from '@/stores/use-editorstore'
import TextAlign from '@tiptap/extension-text-align'
import Strike from '@tiptap/extension-strike'
import Code from '@tiptap/extension-code'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import { Color } from '@tiptap/extension-text-style'
import { TextStyle, FontFamily } from '@tiptap/extension-text-style'
import { useEffect } from 'react'


interface TipTapEditorProps{
  content:string;
  onChange:(content:string)=>void;
 
}
const TiptapEditor = ({content,onChange}:TipTapEditorProps) => {
  const {setEditor}=useEditorStore()
  const editor = useEditor({
    onCreate({editor}){
      setEditor(editor)
    },
    onDestroy(){
      setEditor(null)
    },
    onUpdate({editor}){
      setEditor(editor)
      onChange(editor.getHTML())
    },
    onSelectionUpdate({editor}){
      setEditor(editor)
    },
    onFocus({editor}){
      setEditor(editor)
    },
    onBlur({editor}){
      setEditor(editor)
    },
    onContentError({editor}){
      setEditor(editor)
    },
    editorProps:{
      attributes:{
        style: 'padding-left: 56px; padding-right: 56px;',
        class:'focus:outline-none print:border-0 flex flex-col min-h-[1054px] w-[816px] pt-10 pr-14 pb-10 cursor-text border border-gray-800'
      }
    },
    extensions: [StarterKit,TaskItem.configure({
      nested:true,
    }),TaskList,TableKit,Strike,Code,TextStyle,FontFamily,Highlight,Color,Link.configure({
      openOnClick:false,
      autolink:true,
      defaultProtocol:'https',
    }),TextAlign.configure({
      types:['paragraph','heading','code_block','quote','table','table_row','table_cell']
    })],
    content,
    // Don't render immediately on the server to avoid SSR issues
    immediatelyRender: false,
    
  })
  useEffect(()=>{
    if(editor && content !== editor.getHTML()){
      editor.commands.setContent(content);
    }
  },[content,editor]);

  return ( 
    <div className='size-full overflow-x-auto print:overflow-visible px-4 '>
      <div   className='min-w-max flex justify-center w-[816px] py-4 print:py-0 mx-auto print:w-full print:min-w-0  ' >
      <EditorContent editor={editor} />
      </div>
    
    </div>
    
  )
}

export default TiptapEditor