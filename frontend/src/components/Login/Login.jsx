import React , {useState} from 'react';
import Header from '../Custom/Header';
import { loginFields } from '../../constants/formFields';
import Input from '../Custom/Input';
import FormExtra from '../Custom/FormExtra';
import FormAction from '../Custom/FormAction';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../Store/UserSlice';
import { useNavigate } from 'react-router-dom';

const fields=loginFields;
let fieldsState = {};
fields.forEach(field=>fieldsState[field.id]='');

export default function Login() {

  const [loginState,setLoginState]=useState(fieldsState);

  const handleChange=(e)=>{
    setLoginState({...loginState,[e.target.id]:e.target.value})
  }

  const handleSubmit=(e)=>{
    e.preventDefault();
    authenticateUser();
  }

  // redux state

  const {loading,error} = useSelector((state) => state.user);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authenticateUser = () =>{
    dispatch(loginUser(loginState)).then((result) => {
      if(result.payload) {
        setEmail('');
        setPassword('');
        navigate('/');
      }
    })
  }

  return (
    <div className='w-full py-[100px] flex flex-col items-center'>
      <div>
            <Header
              heading="Login to your account"
              paragraph="Don't have an account yet? "
              linkName="Signup"
              linkUrl="/register"
            />
             <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="-space-y-px">
                  {
                      fields.map(field=>
                              <Input
                                  key={field.id}
                                  handleChange={handleChange}
                                  value={loginState[field.id]}
                                  labelText={field.labelText}
                                  labelFor={field.labelFor}
                                  id={field.id}
                                  name={field.name}
                                  type={field.type}
                                  isRequired={field.isRequired}
                                  placeholder={field.placeholder}
                          />
                      
                      )
                  }
              </div>
              <FormExtra/>
              <FormAction handleSubmit={handleSubmit} text="Login"/>
              {loading&&'Loading....'}
              <br />
              {error && (
                <div className='text-red-700 text-xl w-full bg-red-100 p-2'>{error}</div>
              )}
            </form>
      </div>
    </div>
  )
}
