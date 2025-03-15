import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../config/config';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { CheckCircle, Lock, ArrowLeft } from 'lucide-react';
import { FaGoogle, FaFacebook } from 'react-icons/fa';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";

export default function Checkout() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [step, setStep] = useState(1); // 1: Email+Phone, 2: Payment
  const [orderComplete, setOrderComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [user, setUser] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [error, setError] = useState('');
  const [googleTempData, setGoogleTempData] = useState(null);
  const [needPhoneForGoogle, setNeedPhoneForGoogle] = useState(false);

  useEffect(() => {
    fetchCourseDetails();
    
    // Check if user is already logged in
    const loggedInUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (loggedInUser && token) {
      const userData = JSON.parse(loggedInUser);
      setUser(userData);
      setEmail(userData.email);
      setPhoneNumber(userData.phoneNumber || '');
      setStep(2); // Skip to payment step if logged in
    }
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      const response = await fetch(`${API_URL}/api/courses/${courseId}`);
      const data = await response.json();
      if (data.success) {
        setCourse(data.course);
        // Redirect if course is free
        if (data.course.price === 0) {
          navigate(`/course/${courseId}`);
        }
      }
    } catch (error) {
      console.error('Error fetching course details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setIsProcessing(true);
      setError('');
      
      // Store Google credential for later use if needed
      localStorage.setItem('googleCredential', credentialResponse.credential);
      
      const response = await fetch(`${API_URL}/api/payments/checkout-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          credential: credentialResponse.credential 
        })
      });

      const data = await response.json();
      console.log('Checkout auth response:', data);
      
      if (data.success) {
        // User exists, proceed to payment
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setUser(data.user);
        setEmail(data.user.email);
        setPhoneNumber(data.user.phoneNumber || '');
        setStep(2);
      } else if (data.requiresPhoneNumber) {
        // Need phone number for new Google user
        setNeedPhoneForGoogle(true);
        setGoogleTempData(data.googleData);
        setEmail(data.googleData.email);
        // Clear any existing phone number to ensure the user provides a fresh one
        setPhoneNumber('');
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (error) {
      console.error('Google login error:', error);
      setError('Failed to process Google login: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGoogleError = () => {
    console.error('Google login failed');
    setError('Failed to login with Google');
  };

  const handleEmailPhoneSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError('');
    
    try {
      if (needPhoneForGoogle && googleTempData) {
        // Complete Google registration with phone number
        const googleCredential = localStorage.getItem('googleCredential');
        
        if (!googleCredential) {
          throw new Error('Google credential not found. Please try again.');
        }
        
        const response = await fetch(`${API_URL}/api/payments/checkout-auth`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            credential: googleCredential,
            phoneNumber: phoneNumber,
            email: googleTempData.email
          })
        });
        
        const data = await response.json();
        console.log('Google phone completion response:', data);
        
        if (data.success) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          setUser(data.user);
          setStep(2);
          setNeedPhoneForGoogle(false);
          setGoogleTempData(null);
        } else {
          setError(data.message || 'Failed to complete registration');
        }
      } else {
        // Regular email + phone authentication
        const response = await fetch(`${API_URL}/api/payments/checkout-auth`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            phoneNumber
          })
        });
        
        const data = await response.json();
        console.log('Email/phone auth response:', data);
        
        if (data.success) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          setUser(data.user);
          setStep(2);
        } else {
          setError(data.message || 'Authentication failed');
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError('Authentication failed: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const initializeRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError('');
    
    try {
      if (!user) {
        throw new Error('Please log in to continue');
      }
      
      // Get the token and ensure it exists
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Your session has expired. Please log in again.');
      }
      
      console.log('Using token for payment:', token.substring(0, 15) + '...');
      
      // Create an order on the server
      const orderResponse = await fetch(`${API_URL}/api/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          courseId: courseId,
          amount: course.price
        })
      });
      
      // Handle HTTP errors
      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.message || `Server error: ${orderResponse.status}`);
      }
      
      const orderData = await orderResponse.json();
      console.log('Order created:', orderData);
      
      if (!orderData.success || !orderData.order) {
        throw new Error(orderData.message || 'Failed to create order');
      }
      
      // Initialize Razorpay payment with improved error handling
      const options = {
        key: 'rzp_live_4R9HUZ5jzRkcZH',
        amount: orderData.order.amount,
        currency: orderData.order.currency || 'INR',
        name: "The Digital College",
        description: `Payment for ${course.title}`,
        order_id: orderData.order.id,
        handler: function(response) {
          handlePaymentSuccess(response);
        },
        prefill: {
          name: user.firstName + ' ' + (user.lastName || ''),
          email: user.email,
          contact: user.phoneNumber
        },
        notes: {
          courseId: courseId,
          userId: user._id
        },
        theme: {
          color: "#ffd025"
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
            console.log('Payment modal dismissed');
          }
        }
      };
      
      // Check if Razorpay is available
      if (typeof window.Razorpay === 'undefined') {
        throw new Error('Payment gateway not loaded. Please refresh the page and try again.');
      }
      
      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function(response) {
        console.error('Payment failed:', response.error);
        setError(`Payment failed: ${response.error.description || response.error.reason || 'Unknown error'}`);
        setIsProcessing(false);
      });
      
      rzp.open();
      
    } catch (error) {
      console.error('Payment error:', error);
      setError('Payment initialization failed: ' + error.message);
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = async (response) => {
    try {
      console.log('Payment successful:', response);
      
      // Verify the payment on the server
      const token = localStorage.getItem('token');
      const verifyResponse = await fetch(`${API_URL}/api/payments/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          courseId: courseId
        })
      });
      
      const verifyData = await verifyResponse.json();
      
      if (verifyData.success) {
        setOrderComplete(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        setError(verifyData.message || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setError('Payment verification failed: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] flex flex-col items-center justify-center">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-gray-600 font-medium">Loading checkout...</p>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] py-16">
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-black mb-4">Payment Successful!</h1>
            <p className="text-gray-800 mb-8">
              Thank you for purchasing {course.title}. You now have full access to the course.
            </p>
            <button
              onClick={() => navigate(`/course/${courseId}`)}
              className="bg-[#111827] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#333] transition-all"
            >
              Start Learning
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <GoogleOAuthProvider clientId="1036131393808-7rgoa59ur5gt62i8uj9k2bn63uqe9eci.apps.googleusercontent.com">
      <Navbar />
      <div className="min-h-screen bg-white py-8">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-black mb-8">Checkout</h1>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Checkout Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Step 1: Email & Phone */}
              <div className={`border border-gray-200 rounded-lg p-6 mb-6 ${step !== 1 ? 'bg-gray-50' : 'bg-white'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-black">{needPhoneForGoogle ? 'Complete Your Registration' : '1. Log in or create an account'}</h2>
                  
                  {step === 2 && (
                    <button
                      onClick={() => setStep(1)}
                      className="text-blue-600 flex items-center"
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Change
                    </button>
                  )}
                </div>
                
                {step === 1 ? (
                  <>
                    {needPhoneForGoogle ? (
                      <div className="mb-6">
                        <p className="text-gray-800 mb-4">
                          Please provide your phone number to complete your registration with Google.
                        </p>
                        <form onSubmit={handleEmailPhoneSubmit} className="space-y-4">
                          <div>
                            <label className="block text-gray-800 mb-2">Email (From Google)</label>
                            <input
                              type="email"
                              value={email}
                              className="w-full border border-gray-300 rounded-lg p-3 bg-gray-100 text-gray-800"
                              disabled
                            />
                          </div>
                          <div>
                            <label className="block text-gray-800 mb-2">Phone Number</label>
                            <input
                              type="tel"
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Enter your phone number"
                              required
                            />
                          </div>
                          <button
                            type="submit"
                            disabled={isProcessing}
                            className="w-full bg-[#ffd025] text-[#222222] py-3 rounded-lg font-medium hover:bg-[#ffd025]/90 transition-colors"
                          >
                            {isProcessing ? 'Processing...' : 'Continue'}
                          </button>
                        </form>
                      </div>
                    ) : (
                      <>
                        <p className="text-gray-800 mb-4">
                          An account is required to access your purchased courses. Please
                          verify that your email address is correct, as we'll use it to send your
                          order confirmation.
                        </p>
                        
                        <form onSubmit={handleEmailPhoneSubmit} className="space-y-4">
                          <div>
                            <label className="block text-gray-800 mb-2">Email</label>
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Enter your email address"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-gray-800 mb-2">Phone Number</label>
                            <input
                              type="tel"
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Enter your phone number"
                              required
                            />
                          </div>
                          
                          <p className="text-sm text-gray-700">No password required</p>
                          
                          <button
                            type="submit"
                            disabled={isProcessing}
                            className="w-full bg-[#ffd025] text-[#222222] py-3 rounded-lg font-medium hover:bg-[#ffd025]/90 transition-colors"
                          >
                            {isProcessing ? 'Processing...' : 'Continue'}
                          </button>
                        </form>
                        
                        <div className="mt-6 flex items-center justify-center">
                          <div className="border-t border-gray-300 flex-grow"></div>
                          <span className="text-gray-700 mx-4">or</span>
                          <div className="border-t border-gray-300 flex-grow"></div>
                        </div>
                        
                        <div className="mt-6 grid grid-cols-1 gap-4">
                          <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            text="continue_with"
                            shape="rectangular"
                            width="300"
                          />
                        </div>
                        
                        {error && (
                          <div className="mt-4 text-red-600 text-sm">
                            {error}
                          </div>
                        )}
                      </>
                    )}
                  </> 
                ) : (
                  <div className="flex items-center space-x-4">
                    <div className="bg-green-100 text-green-600 rounded-full p-1">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-gray-800">
                        Logged in as <span className="font-medium">{email}</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Step 2: Payment */}
              <div className={`border ${step === 2 ? 'border-gray-200' : 'border-gray-100 bg-gray-50'} rounded-lg p-6`}>
                <div className="flex items-center mb-4">
                  <h2 className="text-xl font-bold text-black">2. Billing address & Payment method</h2>
                  {step === 1 && <Lock className="ml-2 text-gray-400 w-4 h-4" />}
                </div>
                
                {step === 2 && (
                  <form onSubmit={handlePaymentSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-800 mb-2">Full Name</label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          defaultValue={user?.name || ""}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-800 mb-2">Phone Number</label>
                        <input
                          type="tel"
                          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          defaultValue={user?.phoneNumber || ""}
                          required
                        />
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold mt-6 mb-4 text-black">Payment Method</h3>
                    
                    <div className="space-y-4">
                      <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="card"
                          defaultChecked
                          className="h-5 w-5 text-blue-600"
                        />
                        <span className="ml-3 text-gray-800">Credit/Debit Card</span>
                      </label>
                      
                      <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="upi"
                          className="h-5 w-5 text-blue-600"
                        />
                        <span className="ml-3 text-gray-800">UPI</span>
                      </label>
                      
                      <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="netbanking"
                          className="h-5 w-5 text-blue-600"
                        />
                        <span className="ml-3 text-gray-800">Net Banking</span>
                      </label>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className={`w-full bg-[#ffd025] text-[#222222] py-4 rounded-lg font-semibold hover:bg-[#ffd025]/90 transition-all ${
                        isProcessing ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      {isProcessing ? 'Processing...' : `Complete Payment`}
                    </button>
                    
                    <p className="text-sm text-gray-700 text-center">
                      By completing your purchase, you agree to our Terms of Service and Privacy Policy.
                    </p>
                  </form>
                )}
              </div>

              {/* Order Details */}
              <div className="border border-gray-200 rounded-lg p-6 bg-white">
                <h2 className="text-xl font-bold mb-6 text-black">Order details (1 course)</h2>
                
                <div className="flex items-start space-x-4">
                  <img 
                    src={course.image || '/default-course-image.jpg'} 
                    alt={course.title}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{course.title}</h3>
                    <p className="text-sm text-gray-600">{course.instructor.name}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-gray-800">₹{course.price}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-lg p-6 sticky top-6 border border-gray-200">
                <h2 className="text-xl font-bold text-black mb-6">Order summary</h2>
                
                <div className="flex items-start space-x-4 mb-6 pb-6 border-b border-gray-200">
                  <img 
                    src={course.image || '/default-course-image.jpg'} 
                    alt={course.title}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-800">{course.title}</h3>
                    <p className="text-sm text-gray-600">{course.instructor.name}</p>
                  </div>
                </div>
                
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Original Price:</span>
                    <span className="font-medium text-gray-800">₹{course.price}</span>
                  </div>
                </div>
                
                <div className="flex justify-between font-bold text-lg pt-4 border-t border-gray-200">
                  <span className="text-gray-800">Total</span>
                  <span className="text-gray-800">₹{course.price}</span>
                </div>
                
                <div className="mt-6 bg-orange-50 p-4 rounded-lg border border-orange-100">
                  <div className="flex items-center">
                    <span className="text-orange-500 text-lg mr-2">🔥</span>
                    <h3 className="font-semibold text-black">Tap into Success Now</h3>
                  </div>
                  <p className="text-sm mt-2 text-gray-800">
                    Join 30+ people in your country who've recently enrolled in this course within last 24 hours.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {orderComplete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md mx-auto text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for your purchase. You now have full access to "{course.title}".
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to your learning dashboard...
            </p>
          </div>
        </div>
      )}
    </GoogleOAuthProvider>
  );
} 