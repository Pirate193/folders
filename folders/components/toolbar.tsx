'use client'
import { AlignCenterIcon, AlignJustifyIcon, AlignLeftIcon, AlignRightIcon, BoldIcon, ChevronDownIcon, CodeIcon, HighlighterIcon, ItalicIcon, LinkIcon, ListIcon, ListTodoIcon, LucideIcon, PrinterIcon, RedoIcon, RemoveFormattingIcon, SpellCheckIcon, StrikethroughIcon, UnderlineIcon, Undo2Icon} from 'lucide-react';
import {CirclePicker, SketchPicker, type ColorResult,} from 'react-color'
import React, { useState } from 'react'
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { useEditorStore } from '@/stores/use-editorstore';
import { Level } from '@tiptap/extension-heading';
import { Separator } from './ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Input } from './ui/input';

const ListButton = ()=>{
    const {editor} = useEditorStore();
    
    const list =[
       {
        label:'bullet List',
        icon: ListIcon,
        isActive:()=>editor?.isActive('bulletList'),
        onClick:()=>editor?.chain().focus().toggleBulletList().run()
       },
       {
        label:'ordered List',
        icon:ListTodoIcon,
        isActive:()=>editor?.isActive('orderedList'),
        onClick:()=>editor?.chain().focus().toggleOrderedList().run()
       }
    ]
    return(
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
            <button
            className='h-7 min-w-7 shrink-0 flex items-center flex-col justify-center rounded-sm hover:bg-neutral-500'
            >
              <ListIcon className='size-4' />
            </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='p-1 flex flex-col gap-y-1' >
                {
                    list.map(({label,icon:Icon,onClick,isActive})=>(
                        <button
                        key={label}
                        onClick={onClick}
                        className={cn(
                            'flex items-center gap-x-2 py-1 px-2 rounded-sm hover:bg-neutral-500',
                            isActive() &&'bg-neutral-500'
                        )}
                        >
                         <Icon className='size-4' />
                         <span className='truncate'>
                            {label}
                         </span>
                        </button>
                    ))
                }
                
            
            </DropdownMenuContent>
        </DropdownMenu>
    )
    
}
const AlignButton = ()=>{
    const {editor} = useEditorStore();
    
    const alignments =[
        {label:'Align Left',value:'left',icon:AlignLeftIcon},
        {label:'Align Center',value:'center',icon:AlignCenterIcon},
        {label:'Align Right',value:'right',icon:AlignRightIcon},
        {label:'Align Justify',value:'justify',icon:AlignJustifyIcon},
    ]
    return(
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
            <button
            className='h-7 min-w-7 shrink-0 flex items-center flex-col justify-center rounded-sm hover:bg-neutral-500'
            >
              <AlignLeftIcon className='size-4' />
            </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='p-1 flex flex-col gap-y-1' >
                {
                    alignments.map(({label,value,icon:Icon})=>(
                        <button
                        key={value}
                        onClick={()=>{editor?.chain().focus().setTextAlign(value).run()}}
                        className={cn(
                            'flex items-center gap-x-2 py-1 px-2 rounded-sm hover:bg-neutral-500',
                            editor?.isActive({textAlign:value}) &&'bg-neutral-500'
                        )}
                        >
                         <Icon className='size-4' />
                         <span className='truncate'>
                            {label}
                         </span>
                        </button>
                    ))
                }
                
            
            </DropdownMenuContent>
        </DropdownMenu>
    )
    
}

const LinkButton =()=>{
    const {editor} = useEditorStore();
     const [value,setValue]= useState(editor?.getAttributes('link').href|| '')
     const onChange = (href:string)=>{
        editor?.chain().focus().extendMarkRange('link').setLink({href}).run()
        setValue('');
     };
     return(
        <DropdownMenu onOpenChange={(open)=>{
        if(open){setValue(editor?.getAttributes('link').href|| '')}} } >
            <DropdownMenuTrigger  asChild>
            <button
            className='h-7 min-w-7 shrink-0 flex items-center flex-col justify-center rounded-sm hover:bg-neutral-500'
            >
              <LinkIcon className='size-4' />
            </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='p-2.5 flex items-center gap-x-2' >
              <Input
              placeholder='Paste link here'
              value={value}
              onChange={(e)=>setValue(e.target.value)} />
              <Button onClick={()=>onChange(value)}>
                Apply
              </Button>
            </DropdownMenuContent>
        </DropdownMenu>
     )

}

const HighLightColorButton = ()=>{
    const {editor} = useEditorStore();
    
    const value = editor?.getAttributes('highlight').color|| '#ffffff' ;
    const onChange = (color:ColorResult)=>{
        editor?.chain().focus().setHighlight({color:color.hex}).run()
    }
    return(
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
            <button
            className='h-7 min-w-7 shrink-0 flex items-center flex-col justify-center rounded-sm hover:bg-neutral-500'
            >
              <HighlighterIcon className='size-4' color={value} />
            </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='p-0 border-0' >
                
                <SketchPicker 
                onChange={onChange}
                color={value}
                />
            </DropdownMenuContent>
        </DropdownMenu>
    )
    
}
const TextColorButton = ()=>{
    const {editor} = useEditorStore();
    const value = editor?.getAttributes('textStyle').color|| '#ffffff' ;
    const onChange = (color:ColorResult)=>{
        editor?.chain().focus().setColor(color.hex).run()
    }
    return(
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
            <button
            className='h-7 min-w-7 shrink-0 flex items-center flex-col justify-center rounded-sm hover:bg-neutral-500'
            >
               <span className='text-xs'>
                A
               </span>
               <div className='h-0.5 w-full' style={{backgroundColor:value}}/>
            </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='p-0 border-0' >
                
                <SketchPicker 
                onChange={onChange}
                color={value}
                />
            </DropdownMenuContent>
        </DropdownMenu>
    )
    
}
const HeadingLevelbutton =()=>{
    const {editor} = useEditorStore();

    const heading =[
        {label:'Normal text ',value:0,fontSize:'i6px'},
        {label:'Heading 1',value:1,fontSize:'32px'},
        {label:'Heading 2',value:2,fontSize:'24px'},
        {label:'Heading 3',value:3,fontSize:'20px'},
        {label:'Heading 4',value:4,fontSize:'18px'},
        
    ]
    const getCurrentHeading = ()=>{
        for(let level= 1;level<=4; level++){
            if(editor?.isActive('heading',{level})){
                return level
            }
        }
        return 'Normal text'
    };
    return(
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
            <Button className='h-7 min-w-7 shrink-0 flex items-center justify-center rounded-sm hover:bg-neutral-500'>
                    <span className='truncate'>
                        {getCurrentHeading()}
                    </span>
                    <ChevronDownIcon className='ml-2 size-4 shrink-0' />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                {heading.map(({label,value,fontSize})=>(
                    <button
                    onClick={()=>{
                        if(value ===0){
                            editor?.chain().focus().setParagraph().run()
                        }else{
                            editor?.chain().focus().toggleHeading({level:value as Level}).run()
                        }
                    }}
                    key={value}
                    style={ {fontSize}}
                    className={cn(
                        'flex items-center gap-x-2 px-2 py-1 rounded-sm hover:bg-neutral-500',
                        (value ===0 && !editor?.isActive('heading'))||editor?.isActive('heading',{level:value})&& 'bg-neutral-500'
                      )}
                     >
                     {label}
                    </button>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
    
}
const FontFamilyButton = ()=>{
    const {editor} = useEditorStore();
    const fonts =[
        {label:'Arial',value:'Arial'},
        {label:'Times New Roman',value:'Times New Roman'},
        {label:'Courier New',value:'Courier New'},
        {label:'Georgia',value:'Georgia'},
        {label:'Verdana',value:'Verdana'},
        {label:'Trebuchet MS',value:'Trebuchet MS'},
        {label:'Comic Sans MS',value:'Comic Sans MS'},
    ];
    return(
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button className='h-7 w-[120px] shrink-0 flex items-center justify-between rounded-sm hover:bg-neutral-500'>
                    <span className='truncate'>
                        {editor?.getAttributes('textStyle').fontFamily || 'Arial'}
                    </span>
                    <ChevronDownIcon className='ml-2 size-4 shrink-0' />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='p-1 flex flex-col gap-y-1'>
                {fonts.map(({label,value})=>(
                  <Button
                  onClick={()=> editor?.chain().focus().setFontFamily(value).run()}
                  key={value}
                  className={cn(
                    'flex items-center gap-x-2 px-2 py-1 rounded-sm hover:bg-neutral-500',
                    editor?.getAttributes('textStyle').fontFamily ===value && 'bg-neutral-500'
                  )}
                  style={{fontFamily:value}}>
                  <span className='text-sm'>{label}</span>                 
                  </Button>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}


interface ToolbarButtonProps {
    onClick?:()=>void;
    isActive?:boolean;
    icon:LucideIcon;
};
const ToolbarButton=({
    onClick,isActive,icon:Icon
}:ToolbarButtonProps)=>{
    return(
        <Button onClick={onClick} 
        className={cn(
            'text-sm h-7 min-w-7 flex items-center justify-center rounded-sm hover:bg-neutral-500'
            ,
            isActive && 'bg-neutral-500'
        )}
        >
            <Icon className='siz4-4' />
        </Button>
    )
}
export default function Toolbar() {
    const {editor}=useEditorStore()
    const sections:{label:string;
        icon:LucideIcon;
        onClick?:()=>void;
        isActive?:boolean;
    }[][]= [
        [
            {
                label:'Undo',
                icon:Undo2Icon,
                onClick:()=>editor?.chain().focus().undo().run(),
              
            },
            {
                label:'Redo',
                icon:RedoIcon,
                onClick:()=>editor?.chain().focus().redo().run(),
              
            },
            {
                label:'print',
                icon:PrinterIcon,
                onClick:()=>window.print()
            },
            {
                label:'spellcheck',
                icon:SpellCheckIcon,
                onClick:()=>{
                    const current = editor?.view.dom.getAttribute('spellcheck');
                    editor?.view.dom.setAttribute('spellcheck',current === 'false' ? 'true' : 'false')
                }
            }
        ],
        [
            {
                label:'Bold',
                icon:BoldIcon,
                onClick:()=>editor?.chain().focus().toggleBold().run(),
                isActive:editor?.isActive('bold')
            },
            {
                label:'Italic',
                icon:ItalicIcon,
                onClick:()=>editor?.chain().focus().toggleItalic().run(),
                isActive:editor?.isActive('italic')
            },
            {
                label:'underline',
                icon: UnderlineIcon,
                onClick:()=>editor?.chain().focus().toggleUnderline().run(),
                isActive:editor?.isActive('underline')
            },
            {
                label:'Strikethrough',
                icon:StrikethroughIcon,
                onClick:()=>editor?.chain().focus().toggleStrike().run(),
                isActive:editor?.isActive('strike')
            },
            {
                label:'Code',
                icon:CodeIcon,
                onClick:()=>editor?.chain().focus().toggleCode().run(),
                isActive:editor?.isActive('code')
            },
        ],
        [
            {
                label:'list Todo',
                icon:ListTodoIcon,
                onClick:()=>editor?.chain().focus().toggleTaskList().run(),
                isActive:editor?.isActive('taskList')
            },
            {
                label:'remove formatting',
                icon:RemoveFormattingIcon,
                onClick:()=>editor?.chain().focus().unsetAllMarks().run()
            }
        ]
    ]
  return (
    <div className='px-2.5 py-0.5  min-h-[40px] flex items-center gap-x-0.5 bg-black'
    >
        {sections[0].map(item=>(
            <ToolbarButton
            key={item.label}
            {...item}
            />
        ))}
        <Separator orientation='vertical' className='h-5' />
       
        <Separator orientation='vertical' className='h-6 w-0.5 bg-gray-600' />
        <FontFamilyButton />
        <Separator orientation='vertical' className='h-5' />
        <HeadingLevelbutton />
        <Separator orientation='vertical' className='h-5' />
        {/* todo font size  */}
        <Separator orientation='vertical' className='h-5' />
        {sections[1].map(item=>(
            <ToolbarButton
            key={item.label}
            {...item}
            />
        ))}
        <Separator orientation='vertical' className='h-5' />
        <TextColorButton />
        <HighLightColorButton />
        <Separator orientation='vertical' className='h-5' />
         <LinkButton />
        <AlignButton />
        <Separator orientation='vertical' className='h-5' />
        <ListButton />
        {sections[2].map(item=>(
            <ToolbarButton
            key={item.label}
            {...item}
            />
        ))}
        
    </div>
  )
}
