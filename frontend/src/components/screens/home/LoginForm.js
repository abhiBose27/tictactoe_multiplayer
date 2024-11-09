import PropTypes from "prop-types"
import { useState } from "react"
import { 
    Form, 
    Segment, 
    Button, 
    Grid, 
    GridColumn, 
    FormInput, 
    Divider, 
    Message,
    FormField,
    MessageHeader,
    Modal
} from "semantic-ui-react"
import { MESSAGES } from "../../../Messages"
import { initFormState } from "../../../Reducer"


export const LoginForm = ({socket, authError, setAuthError, triggerModal}) => {
    const [signUp, setSignUp]       = useState(false)
    const [formState, setFormState] = useState(initFormState)

    const onChange = (e, { name, value }) => {
        setFormState(prev => {
            return signUp ? {
                ...prev,
                signUp: {
                    ...prev.signUp,
                    [name]: value
                }
            } : {
                ...prev,
                login: {
                    ...prev.login,
                    [name]: value
                }
            }
        })   
    }

    const onSubmit = (e) => {
        socket.send(JSON.stringify({
            type: signUp ? MESSAGES.SIGNUP : MESSAGES.LOGIN,
            payload: signUp ? formState.signUp : formState.login
        }))
    }

    const onClickSignUp = (e) => {
        setFormState(initFormState)
        setAuthError(null)
        setSignUp(prev => !prev)
    }

    return (
        <Modal size="small" open onClose={triggerModal}>
            <Segment placeholder>
                <Grid columns={2} relaxed="very" stackable>
                    <GridColumn> 
                        <Form onSubmit={onSubmit}>
                            <FormInput
                                icon="mail"
                                label="Email"
                                name="emailId"
                                iconPosition="left"
                                onChange={onChange}
                                value={signUp ? formState.signUp.emailId : formState.login.emailId}
                            />
                            {signUp && <FormInput
                                icon="user"
                                label="Username"
                                name="userName"
                                iconPosition="left"
                                placeholder="Username"
                                onChange={onChange}
                                value={formState.signUp.userName}
                            />}
                            <FormInput
                                icon="lock"
                                label="Password"
                                type="password"
                                name="password"
                                iconPosition="left"
                                onChange={onChange}
                                value={signUp ? formState.signUp.password: formState.login.password}
                            />
                            {signUp && <FormInput
                                icon="lock"
                                type="password"
                                iconPosition="left"
                                name="confirmPassword"
                                label="Confirm Password"
                                onChange={onChange}
                                value={formState.signUp.confirmPassword}
                            />}
                            {authError && <FormField>
                                <Message size="small" negative>
                                    <MessageHeader>{authError}</MessageHeader>
                                </Message>
                            </FormField>}
                            <Button content={signUp ? "Sign Up" : "Log In"} primary/>
                        </Form>
                    </GridColumn>
                    <GridColumn verticalAlign="middle">
                        <Button onClick={onClickSignUp} content={signUp ? "Log In": "Sign Up"} icon="signup" size="big" />
                    </GridColumn>
                </Grid>
                <Divider vertical>Or</Divider>
            </Segment>
        </Modal>
    )
}

LoginForm.propTypes = {
    authError: PropTypes.string,
    socket: PropTypes.object.isRequired,
    setAuthError: PropTypes.func.isRequired,
    triggerModal: PropTypes.func.isRequired
}