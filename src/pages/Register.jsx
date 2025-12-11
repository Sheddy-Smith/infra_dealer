import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

const Register = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-2xl">ID</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/login" className="font-medium text-primary hover:text-blue-700">
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              InfraDealer uses OTP-based authentication. Please use the login page to sign in or create an account.
            </p>
            <Link
              to="/login"
              className="btn btn-primary inline-flex items-center"
            >
              <ArrowLeft size={18} className="mr-2" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
