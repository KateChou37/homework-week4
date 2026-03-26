import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as bootstrap from 'bootstrap'
import "./assets/style.css";

//拆分元件
import ProductModal from './components/ProductModal';
import Pagination from './components/Pagination';
import Login from './views/Login';

//API設定
const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

//產品資料模板
const INITIAL_TEMPLATE_DATA = {
  id: "",
  title: "",
  category: "",
  origin_price: "",
  price: "",
  unit: "",
  description: "",
  content: "",
  is_enabled: false,
  imageUrl: "",
  imagesUrl: [],
  size: "",
};

//登入表單資料狀態
function App() {

// 登入狀態管理(控制顯示登入或產品頁）
const [isAuth,setIsAuth] = useState(false);
//新增:登入前確認狀態
const [isChecking, setIsChecking] = useState(true);//// 新增：正在檢查登入狀態
  
// 產品列表狀態
const [products ,setProducts] = useState([]);
const [templateProduct , setTemplateProduct] = useState(INITIAL_TEMPLATE_DATA);
const [modalType, setModalType] = useState();// create or edit
const [pagination, setPagination] = useState({});
const productModalRef = useRef(null);

// 取得產品列表
const getProducts = async (page = 1) => {
  try{
    const response = await axios.get(
      `${API_BASE}/api/${API_PATH}/admin/products?page=${page}`
    );
    setProducts(response.data.products);
    setPagination(response.data.pagination);
  }catch(error){
  console.log(error.response);
 }
};

useEffect(() => {
    // 讀取 Cookie 取出 Token 並設定 Axios 預設頭部
        const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("hexToken="))
        ?.split("=")[1];
    if(token){
    axios.defaults.headers.common["Authorization"] = token;
    }
    //初始化 Modal 實例（不論登入與否，DOM 裡有這個 ID 就能初始化）
    // productModalRef.current = new bootstrap.Modal('#productModal',{
    //   keyboard: false,
    // })
    //定義檢查登入的函式
    const checkLogin = async () => {
      // 如果連 token 都沒有，直接判定未登入，不用發請求
      if (!token) {
      setIsAuth(false);
      setIsChecking(false);
      return;
    }
      try{
        const response = await axios.post(`${API_BASE}/api/user/check`);
        console.log(response.data);
        setIsAuth(true);// 驗證成功
        getProducts();   // 驗證成功後直接抓資料
      }catch (error){
        console.log(error.response?.data.message);
        setIsAuth(false); // 驗證失敗
      } finally{
        setIsChecking(false); // 驗證完成，無論成功與否都結束檢查狀態
      }
    };
    //  執行檢查
    checkLogin();
  },[])

  const openModal = (type, product) => {
    // console.log(product);
    setModalType(type);
    setTemplateProduct((pre) =>({
      ...INITIAL_TEMPLATE_DATA,
      ...product,
    }));

    // 如果還沒初始化，就在這裡初始化
  if (!productModalRef.current) {
    const modalElement = document.getElementById('productModal');
    if (modalElement) {
      productModalRef.current = new bootstrap.Modal(modalElement, {
        keyboard: false,
      });
    }
  }
    // 確保實例存在後再顯示
    productModalRef.current?.show();
}
  const closeModal = () => {
    productModalRef.current.hide();
  }
  // 如果還在檢查中，可以顯示一個 Loading 畫面，避免直接跳到產品頁
  if (isChecking){
    return <div className="text-center mt-5">驗證身份中...</div>;
  }
  return (
    <>
    {
      !isAuth ? ( 
      <Login getProducts={getProducts} setIsAuth={setIsAuth} />

      ):(
      <div className='container '>  
      {/* 產品列表 */}
      <div className="row">
          <h3 className="fw-bold mt-5 ">產品列表</h3>
          <div className="text-end mt-4">
        <button
          type="button"
          className="btn btn-primary mb-4"
          onClick={() => openModal("create",INITIAL_TEMPLATE_DATA)}>
          建立新的產品
        </button>
      </div>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">分類</th>
              <th scope="col">產品名稱</th>
              <th scope="col">原價</th>
              <th scope="col">售價</th>
              <th scope="col">是否啟用</th>
              <th scope="col">編輯</th>
            </tr>
          </thead>
          <tbody>
            {
              products.map((product) => (
              <tr key={product.id} >
                <td>{product.category}</td>
                <th scope="row" >{product.title}</th>
                <td>{product.origin_price}</td>
                <td>{product.price}</td>
                <td className={`${product.is_enabled && "text-success"}`}>
                  {product.is_enabled ? '啟用' : '未啟用'}
                </td>
                <td><div className="btn-group" role="group" aria-label="Basic example">
                    <button type="button" 
                    className="btn btn-primary btn-sm"
                    onClick={() => openModal('edit',product)}>編輯</button>
                    <button 
                    type="button" 
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => openModal('delete', product)}>
                      刪除
                    </button>
</div>
                </td>
            </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* 分頁 */}
      < Pagination 
      pagination={pagination}
      onChangePage={getProducts}
      />
      </div>
    )}

   {/* modal視窗 */}
    < ProductModal 
    modalType={modalType}
    templateProduct={templateProduct}
    getProducts = {getProducts}
    closeModal ={closeModal}
    />
    </>
  );
}

export default App 
