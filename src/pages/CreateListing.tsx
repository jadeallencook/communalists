import { useEffect } from 'react'
import { Container } from 'react-bootstrap'
import { useParams } from 'react-router-dom'

import CreateListingForm from '../components/organisms/CreateListingForm'

const CreateListing = () => {
    const params = useParams()

  return (
    <Container>
        <h1>Create Listing for {params.userId}</h1>
        <CreateListingForm 
            userId={params.userId}/>
    </Container>
  )
}

export default CreateListing