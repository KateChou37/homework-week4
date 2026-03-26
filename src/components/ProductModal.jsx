import { useEffect, useState} from "react";
import axios from 'axios';

//API設定
const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function ProductModal({
    modalType,
    templateProduct,
    getProducts,
    closeModal,
}){
  //初始質
const [tempData, setTempData] = useState(templateProduct);

useEffect(() => {
  setTempData(templateProduct);
},[templateProduct]);
  // 處理產品資料輸入變化
const handleModalInputChange = (e) => {
  const { name ,value , checked, type} = e.target;

  //console.log(name,value);
  setTempData((preData) => ({
    ...preData,// 保留原有屬性
    [name]: type === 'checkbox' ?  checked: value,// 更新特定屬性
  }));
};
// 處理圖片網址輸入變化
const handleModalImageUrlChange = (index , value) => {
  setTempData((pre) => {
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
   setTempData((pre) => {
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
    setTempData((pre) => {
      const newImage = [...pre.imagesUrl];
      newImage.pop();
      return{
        ...pre,
        imagesUrl: newImage,
      }
    });
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
      ...tempData,
      origin_price: Number(tempData.origin_price),
      price: Number(tempData.price),
      is_enabled: tempData.is_enabled ? 1 : 0,
      imagesUrl:[...tempData.imagesUrl.filter((url) => url !== "")],
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

const uploadImage = async (e) => {
    const file = e.target.files?.[0]
    if(!file){
      return;
    } 
    try{
      const formData = new FormData()
      formData.append("file-to-upload", file);
      const response = await axios.post(
        `${API_BASE}/api/${API_PATH}/admin/upload`
        ,formData
      );
      setTempData((pre) => ({
        ...pre,
        imageUrl: response.data.imageUrl,
      }));
    }catch(error){
      if(error.response){
      // 伺服器有回傳回應 (如 400, 500)  
      const status = error.response.status ;
      switch (status){
        case 413:
          alert("檔案過大，請選擇小於 2MB 的圖片");
          break;
        case 401:
          alert("連線逾時，請重新登入");
          break;
        default:
          alert(`上傳失敗`);
          }
        } else if (error.request) {
          // 請求已發出但沒有收到回應
          alert('網路連線不穩定，請檢查您的網路狀態');
        } else {
          // 設定請求時發生錯誤
          alert('發生未知錯誤');
        }
      }
    };

    return(
        <div className="modal fade" 
    id="productModal" 
    tabIndex="-1" 
    aria-labelledby="productModalLabel" 
    aria-hidden="true"
    >
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
              <span className='text-danger'>{tempData.title}</span> 嗎？
            </p>
          ):(
        <div className="row">
          <div className="col-sm-4">
            <div className="mb-2">
              <div className="mb-3">
                <div className="mb-3">
                <label htmlFor="fileUpload" className="form-label">
                  上傳圖片
                </label>
                <input 
                className="form-control" 
                type="file" 
                name="fileUpload" 
                id="fileUpload" 
                accept=".jpg,.jpeg,.png,.gif"
                onChange={(e) => uploadImage(e)}
                />
                </div>
                <label htmlFor="imageUrl" className="form-label">
                  輸入圖片網址
                </label>
                <input
                  type="text"
                  id="imageUrl"
                  name="imageUrl"
                  className="form-control"
                  placeholder="請輸入圖片連結"
                  value={tempData.imageUrl}
                  onChange={(e) => handleModalInputChange(e)}
                  />
              
                  {tempData.imageUrl && (
                      <img 
                      className="img-fluid" 
                      src={tempData.imageUrl} 
                      alt="主圖" 
                      />
                    )}               
              </div>
              <div>
                {
                tempData.imagesUrl.map((url , index) => (
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
                value={tempData.title}
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
                  value={tempData.category}
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
                  value={tempData.unit}
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
                  value={tempData.origin_price}
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
                  value={tempData.price}
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
                value={tempData.description}
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
                value={tempData.content}
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
                  checked={tempData.is_enabled}
                  onChange={(e) => handleModalInputChange(e)}
                  />
                <label className="form-check-label" htmlFor="is_enabled">
                  是否啟用
                </label>
              </div>
            </div>
            <div className="mb-3">
  <label className="form-check-label" htmlFor="size">
    尺寸
  </label>
  <select
    id="size"
    name="size"
    className="form-select"
    aria-label="Default select example"
    value={tempData.size}
    onChange={(e) => handleModalInputChange(e)}
  >
    <option value="">請選擇</option>
    <option value="lg">12吋</option>
    <option value="md">6吋</option>
    <option value="sm">4吋</option>
  </select>
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
            onClick={() => deleteProduct(tempData.id)}
            >
              刪除
            </button>
            ) : (
              <>
        <button
          type="button"
          className="btn btn-outline-secondary"
          data-bs-dismiss="modal"
          onClick={() => closeModal(tempData.id)}
          >
          取消
        </button>
        <button 
        type="button" 
        className="btn btn-primary"
        onClick={() => updateProduct(tempData.id)}
        >確認
        </button>
              </>
            )}
      </div>
    </div>      
    </div>
    </div>

    )
}

export default ProductModal;