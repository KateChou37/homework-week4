import { useState } from 'react';
import axios from 'axios';

//API設定
const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function Login({ setIsAuth, getProducts
    // 這裡的 setIsAuth 和 getProducts 
    // 是從 App.jsx 傳入的 props，
    // 用於更新登入狀態和獲取產品資料
}) {
       // 表單資料狀態(儲存登入表單輸入)
    const [formData, setFormData] = useState({
        username: '',
        password: '',
      });

        // 表單輸入處理
    const handleInputChange = (e) =>{
    const { name ,value} = e.target;
    //console.log(name,value);
     setFormData((preData) => ({
     ...preData,// 保留原有屬性
        [name]: value,// 更新特定屬性
     }));
    };
    const onSubmit = async (e) => {
  try{
    e.preventDefault();
    const response = await axios.post(`${API_BASE}/admin/signin`, formData);
    console.log(response.data);
    const{ token , expired} = response.data;
    // 設定 Cookie
    document.cookie = `hexToken=${token}; expires = ${new Date(expired)};`;
    // 讀取 Cookie
    axios.defaults.headers.common['Authorization'] = token;
    // getProducts();
    // setIsAuth(true)
    // 沒有辦法直接抽進來是因為
    // Login.jsx沒有引入getProducts和setIsAuth，
    // 所以需要從App.jsx傳入這兩個函式作為props，
    // 才能在Login.jsx中使用它們來更新登入狀態和獲取產品資料。
    getProducts();
    setIsAuth(true);
  }
  catch(error){
    setIsAuth(false);
    console.error(error.response);
  }
};

    return(
        <div className='container text-center'>
        {/* 登入頁面 */}
      <div className=" row d-flex justify-content-center align-items-center " style={{height: "100vh"}}>
        <div className=" col-5 rounded-5 px-5 py-4  shadow">
          <h3 className="card-title mb-4 fw-bold text-primary">LOGIN</h3>
          <form className="form-floating" onSubmit={(e) => onSubmit(e)}>
           <div className="form-floating mb-3">
              <input type="email" 
                className="form-control" 
                name="username" 
                id="username"
                placeholder="name@example.com"
                value={formData.username} 
                onChange={(e) => handleInputChange(e) }
                autoComplete="username"
              />
              <label htmlFor="username">Email address</label>
              
            </div>
            <div className="form-floating mb-3">
              <input type="password" 
                className="form-control" 
                name="password" 
                id="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => handleInputChange(e) }
                autoComplete="current-password" 
              />
              <label htmlFor="password">Password</label>
            </div>
            <button type="submit" className="btn btn-primary w-100 mb-4">登入</button>
          </form>   
           <p className='text-center text-secondary'>©2025-KateChou</p>
        </div>
      </div>
     
    </div>

    )
}
export default Login
