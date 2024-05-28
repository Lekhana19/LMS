import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter className="px-4">
      <div>
        <a href="https://github.com/gopinathsjsu/team-project-recursive-rebels" target="_blank" rel="noopener noreferrer">
        Team Recursive Rebels
        </a>
        <span className="ms-1">&copy; 202-LMS-Project.</span>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
