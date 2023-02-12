import getIndividualRequest from "@api/get-individual-request"
import ViewRequestForm from "@forms/ViewRequestForm"
import RequestAidInterface from "@interfaces/request-aid"
import timestampToDateString from "@utils/timestamp-to-date-string"
import { useEffect, useState } from "react"
import { Spinner } from "react-bootstrap"
import { useParams } from "react-router-dom"

const ViewRequest = () => {

    const { uid } = useParams()
    const [request, setRequest] = useState<RequestAidInterface | undefined>(undefined)
    const [isLoading, setIsLoading] = useState<boolean>(true)

    useEffect(() => {
        getIndividualRequest(uid)
            .then((res) => {
                setRequest(res)
                setIsLoading(false)
            })
    }, [])

    return (
        <>
            {isLoading ? (
                <div style={{ width: '100vw', margin: '50px auto', textAlign: 'center' }}>
                    <Spinner animation="border" />
                </div>
            ) : (
                <>
                    {request ? (
                        <>
                            <h2 style={{ margin: '20px auto', textAlign: 'center' }}>{`Request for ${request.name} made on ${timestampToDateString(request.timestamp)}`} </h2>
                            <ViewRequestForm
                                request={request}
                                selected={uid}
                            />
                        </>
                    ) : (
                        <div style={{ width: '100vw', margin: '50px auto', textAlign: 'center' }}><h2>404: Request not found</h2></div>
                    )}
                </>
            )}
        </>
    )
}
export default ViewRequest