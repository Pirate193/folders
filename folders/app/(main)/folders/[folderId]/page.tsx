import React from 'react'
import Overview from './overview'

export default async function FolderPage({params}:{params:Promise<{folderId:string}>}) {
   const {folderId} = await params
  return (
    <div className='flex-1' > 
      
      <Overview folderId={folderId} />
     </div>

  )
}
