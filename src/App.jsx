import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as bootstrap from 'bootstrap'
import "./assets/style.css";

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
};


//登入表單資料狀態
function App() {
   // 表單資料狀態(儲存登入表單輸入)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
// 登入狀態管理(控制顯示登入或產品頁）
const [isAuth,setIsAuth] = useState(false);
  
// 產品列表狀態
const [products ,setProducts] = useState([]);
const [templateProduct , setTemplateProduct] = useState(INITIAL_TEMPLATE_DATA);
const [modalType, setModalType] = useState();// create or edit
const productModalRef = useRef(null);

// 表單輸入處理
const handleInputChange = (e) =>{
const { name ,value} = e.target;
  //console.log(name,value);
  setFormData((preData) => ({
    ...preData,// 保留原有屬性
    [name]: value,// 更新特定屬性
  }));
};
// 處理產品資料輸入變化
const handleModalInputChange = (e) => {
  const { name ,value , checked, type} = e.target;

  //console.log(name,value);
  setTemplateProduct((preData) => ({
    ...preData,// 保留原有屬性
    [name]: type === 'checkbox' ?  checked: value,// 更新特定屬性
  }));
};
// 處理圖片網址輸入變化
const handleModalImageUrlChange = (index , value) => {
  setTemplateProduct((pre) => {
    const newImage = [...pre.imagesUrl];
    newImage[index] = value;
    
    //圖片最多不能超過5張
    if(value !== "" && index === newImage.length - 1 && newImage.length < 5){
      newImage.push("");
    }
    //圖片最少要保留1張
    if(value === "" &&  newImage.length > 1 && [newImage.length-1]){
      newImage.pop();
    }
    return {
      ...pre,
      imagesUrl: newImage,
    };
  });
};
//新增圖片網址
const handleAddImageUrl = () => {
   setTemplateProduct((pre) => {
    const newImage = [...pre.imagesUrl];
    newImage.push("");
    return {
      ...pre,
      imagesUrl: newImage,
    };
  });
};
//刪除最後一個圖片網址
const handleRemoveImageUrl = () => {
    setTemplateProduct((pre) => {
      const newImage = [...pre.imagesUrl];
      newImage.pop();
      return{
        ...pre,
        imagesUrl: newImage,
      }
    });
};
// 取得產品列表
const getProducts = async () => {
  try{
    const response = await axios.get(
      `${API_BASE}/api/${API_PATH}/admin/products`
    );
    setProducts(response.data.products);
  }catch(error){
  console.log(error.response);
 }
};
// 更新產品
const updateProduct = async (id) => {
  let url = `${API_BASE}/api/${API_PATH}/admin/product`;
  let method = "post";

  if(modalType === 'edit'){
    url = `${API_BASE}/api/${API_PATH}/admin/product/${id}`;
    method = "put";
  }
  const productData = {
    data:{
      ...templateProduct,
      origin_price: Number(templateProduct.origin_price),
      price: Number(templateProduct.price),
      is_enabled: templateProduct.is_enabled ? 1 : 0,
      imagesUrl:[...templateProduct.imagesUrl.filter((url) => url !== "")],
    },
  };

  try{
    const response = await axios[method](url, productData);
    console.log(response.data);
    getProducts();
    closeModal();
  }
  catch(error){
    console.error(error.response);
  }
};
// 刪除產品
const deleteProduct = async (id) => {
  try{
    const response = await axios.delete(`${API_BASE}/api/${API_PATH}/admin/product/${id}`);
    console.log(response.data);
    getProducts();
    closeModal();
  }catch(error){
    console.error(error.response);
  };
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
    getProducts();
    setIsAuth(true);
  }
  catch(error){
    setIsAuth(false);
    console.error(error.response);
  }
};


useEffect(() => {
    // 讀取 Cookie
        const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("hexToken="))
        ?.split("=")[1];
    if(token){
    axios.defaults.headers.common["Authorization"] = token;
    }

    productModalRef.current = new bootstrap.Modal('#productModal',{
      keyboard: false,
    })

    const checkLogin = async () => {
      try{
        const response = await axios.post(`${API_BASE}/api/user/check`);
        console.log(response.data);
        setIsAuth(true);
      }catch (error){
        console.log(error.response?.data.message)
      }
    };

    checkLogin();
  },[])

  const openModal = (type, product) => {
    // console.log(product);
    setModalType(type)
    setTemplateProduct((pre) =>({
      ...pre,
      ...product,
    }) );
    productModalRef.current.show();
}
  const closeModal = () => {
    productModalRef.current.hide();
    
  }
  return (
    <>
    {
      !isAuth ? ( <div className='container text-center'>
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
     
    </div>):(
      <div className='container'>
         
      
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
      </div>
    )}
   {/* modal視窗 */}
    <div className="modal fade" 
    id="productModal" 
    tabIndex="-1" 
    aria-labelledby="productModalLabel" 
    aria-hidden="true"
    ref={productModalRef}>
  <div className="modal-dialog modal-xl">
      <div className="modal-content border-0">
      <div className={`modal-header bg-${modalType === 'delete' ? 'danger' : 'dark'} text-white`}>
        <h5 id="productModalLabel" className="modal-title">
          <span>{modalType === 'delete' ? '刪除' : modalType === 'edit' ? '編輯' : '新增'}</span>
        </h5>
        <button
          type="button"
          className="btn-close"
          data-bs-dismiss="modal"
          aria-label="Close"
          ></button>
      </div>
      <div className="modal-body">
        {
          modalType === 'delete' ? (
            <p className='fs-4'>
              確定要刪除 
              <span className='text-danger'>{templateProduct.title}</span> 嗎？
            </p>
          ):(
        <div className="row">
          <div className="col-sm-4">
            <div className="mb-2">
              <div className="mb-3">
                {/* {
                  templateProduct.imageUrl.map((url , index) => (
                <div key={index}> */}
                <label htmlFor="imageUrl" className="form-label">
                  輸入圖片網址
                </label>
                <input
                  type="text"
                  id="imageUrl"
                  name="imageUrl"
                  className="form-control"
                  placeholder="請輸入圖片連結"
                  value={templateProduct.imageUrl}
                  onChange={(e) => handleModalInputChange(e)}
                  />
                  {/* </div>  */}
                  {templateProduct.imageUrl && (
                      <img 
                      className="img-fluid" 
                      src={templateProduct.imageUrl} 
                      alt="主圖" 
                      />
                    )}               
              </div>
              <div>
                {
                templateProduct.imagesUrl.map((url , index) => (
              <div key={index}>
					      <label htmlFor="imageUrl" className="form-label">
					        輸入圖片網址
					      </label>
					      <input
					        type="text"
					        className="form-control"
					        placeholder={`圖片網址${index + 1}`}
                  value={url}
                  onChange={(e) => handleModalImageUrlChange(index, e.target.value)}
					      />
                {
                  url && 
					      <img
                  className="img-fluid"
                  src={url}
                  alt={`副圖${index + 1}`}
                />
                }
					    </div>
            ))
                }
              <button 
              className="btn btn-outline-primary btn-sm d-block w-100"
              onClick={() => handleAddImageUrl()}>
                新增圖片
              </button>
            </div>
            <div>
              <button 
              className="btn btn-outline-danger btn-sm d-block w-100"
              onClick={() =>handleRemoveImageUrl()}>
                刪除圖片
              </button>
            </div>
          </div>
        </div>
          <div className="col-sm-8">
            <div className="mb-3">
              <label htmlFor="title" className="form-label">
                標題
              </label>
              <input
                name="title"
                id="title"
                type="text"
                className="form-control"
                placeholder="請輸入標題"
                value={templateProduct.title}
                onChange={(e) => handleModalInputChange(e)}
                />
            </div>

            <div className="row">
              <div className="mb-3 col-md-6">
                <label htmlFor="category" className="form-label">分類</label>
                <input
                  name="category"
                  id="category"
                  type="text"
                  className="form-control"
                  placeholder="請輸入分類"
                  value={templateProduct.category}
                  onChange={(e) => handleModalInputChange(e)}
                  />
              </div>
              <div className="mb-3 col-md-6">
                <label htmlFor="unit" className="form-label">單位</label>
                <input
                  name="unit"
                  id="unit"
                  type="text"
                  className="form-control"
                  placeholder="請輸入單位"
                  value={templateProduct.unit}
                  onChange={(e) => handleModalInputChange(e)}
                  />
              </div>
            </div>

            <div className="row">
              <div className="mb-3 col-md-6">
                <label htmlFor="origin_price" className="form-label">原價</label>
                <input
                  name="origin_price"
                  id="origin_price"
                  type="number"
                  min="0"
                  className="form-control"
                  placeholder="請輸入原價"
                  value={templateProduct.origin_price}
                  onChange={(e) => handleModalInputChange(e)}
                  />
              </div>
              <div className="mb-3 col-md-6">
                <label htmlFor="price" className="form-label">售價</label>
                <input
                  name="price"
                  id="price"
                  type="number"
                  min="0"
                  className="form-control"
                  placeholder="請輸入售價"
                  value={templateProduct.price}
                  onChange={(e) => handleModalInputChange(e)}
                  />
              </div>
            </div>
            <hr />

            <div className="mb-3">
              <label htmlFor="description" className="form-label">產品描述</label>
              <textarea
                name="description"
                id="description"
                className="form-control"
                placeholder="請輸入產品描述"
                value={templateProduct.description}
                onChange={(e) => handleModalInputChange(e)}
                ></textarea>
            </div>
            <div className="mb-3">
              <label htmlFor="content" className="form-label">說明內容</label>
              <textarea
                name="content"
                id="content"
                className="form-control"
                placeholder="請輸入說明內容"
                value={templateProduct.content}
                onChange={(e) => handleModalInputChange(e)}
                ></textarea>
            </div>
            <div className="mb-3">
              <div className="form-check">
                <input
                  name="is_enabled"
                  id="is_enabled"
                  className="form-check-input"
                  type="checkbox"
                  checked={templateProduct.is_enabled}
                  onChange={(e) => handleModalInputChange(e)}
                  />
                <label className="form-check-label" htmlFor="is_enabled">
                  是否啟用
                </label>
              </div>
            </div>
          </div>
      </div>
          )}
      </div>
      <div className="modal-footer">
        {modalType === 'delete' ? (
            <button 
            type="button"
            className="btn btn-danger"
            onClick={() => deleteProduct(templateProduct.id)}
            >
              刪除
            </button>
            ) : (
              <>
        <button
          type="button"
          className="btn btn-outline-secondary"
          data-bs-dismiss="modal"
          onClick={() => closeModal(templateProduct.id)}
          >
          取消
        </button>
        <button 
        type="button" 
        className="btn btn-primary"
        onClick={() => updateProduct(templateProduct.id)}
        >確認
        </button>
              </>
            )}
      </div>
    </div>      
    </div>
</div>
    </>

  );
}


export default App 
