import React from 'react'

const SelectedUser = (props) => {
  return (
    <div className='flex flex-col items-center justify-center'>
        <h1>{props.user.name}</h1>
        <h1>{props.user.email}</h1>
    </div>
  )
}

export default SelectedUser