// Write your code here
import {Component} from 'react'
import {Link} from 'react-router-dom'
import Loader from 'react-loader-spinner'
import {BsPlusSquare, BsDashSquare} from 'react-icons/bs'
import Cookies from 'js-cookie'
import './index.css'
import Header from '../Header'
import SimilarProductItem from '../SimilarProductItem'

const apiStatusConstants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}

class ProductItemDetails extends Component {
  state = {
    apiStatus: apiStatusConstants.initial,
    productList: {},
    similarProductsList: [],
    quantity: 1,
  }

  componentDidMount() {
    this.getProductItemDetails()
  }

  getProductItemDetails = async () => {
    this.setState({
      apiStatus: apiStatusConstants.inProgress,
    })
    const {match} = this.props
    const {params} = match
    const {id} = params
    const jwtToken = Cookies.get('jwt_token')
    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      method: 'GET',
    }
    const apiUrl = `https://apis.ccbp.in/products/${id}`
    const response = await fetch(apiUrl, options)
    if (response.ok === true) {
      const fetchedData = await response.json()
      const updatedData = {
        id: fetchedData.id,
        imageUrl: fetchedData.image_url,
        title: fetchedData.title,
        brand: fetchedData.brand,
        totalReviews: fetchedData.total_reviews,
        rating: fetchedData.rating,
        availability: fetchedData.availability,
        price: fetchedData.price,
        description: fetchedData.description,
      }

      const updatedSimilarData = fetchedData.similar_products.map(product => ({
        title: product.title,
        brand: product.brand,
        price: product.price,
        id: product.id,
        imageUrl: product.image_url,
        rating: product.rating,
      }))

      this.setState({
        productList: updatedData,
        similarProductsList: updatedSimilarData,
        apiStatus: apiStatusConstants.success,
      })
    }
    if (response.status === 404) {
      this.setState({
        apiStatus: apiStatusConstants.failure,
      })
    }
  }

  onIncrementQuantity = () => {
    this.setState(prevState => ({quantity: prevState.quantity + 1}))
  }

  onDecrementQuantity = () => {
    const {quantity} = this.state
    if (quantity > 1) {
      this.setState(prevState => ({quantity: prevState.quantity - 1}))
    }
  }

  renderProductItemDetails = () => {
    const {productList, quantity} = this.state
    const {
      imageUrl,
      title,
      brand,
      totalReviews,
      availability,
      rating,
      price,
      description,
    } = productList
    return (
      <>
        <div className="product-view">
          <img src={imageUrl} alt="product" className="product-img" />
          <div className="product-summary">
            <h1 className="product-heading">{title}</h1>
            <h1 className="cost">Rs {price}/- </h1>
            <div className="review-box">
              <div className="rating-container">
                <p className="rating">{rating}</p>
                <img
                  src="https://assets.ccbp.in/frontend/react-js/star-img.png"
                  alt="star"
                  className="star"
                />
              </div>
              <p className="reviews">
                <span className="special">{totalReviews}</span> Reviews
              </p>
            </div>
            <p className="description">{description}</p>
            <p className="availability">
              <span className="special">Available:</span>
              {availability}
            </p>
            <p className="availability">
              <span className="special">Brand:</span>
              {brand}
            </p>
            <hr className="h-line" />
            <div className="button-box">
              <button
                type="button"
                className="btn"
                testid="minus"
                onClick={this.onDecrementQuantity}
              >
                <BsDashSquare size={30} />
              </button>
              <p className="value">{quantity}</p>
              <button
                type="button"
                className="btn"
                testid="plus"
                onClick={this.onIncrementQuantity}
              >
                <BsPlusSquare size={30} />
              </button>
            </div>
            <button type="button" className="continue-shop-btn">
              ADD TO CART
            </button>
          </div>
        </div>
        {this.renderSimilarProducts()}
      </>
    )
  }

  renderSimilarProducts = () => {
    const {similarProductsList} = this.state
    return (
      <>
        <div className="similar-list">
          <h1 className="heading">Similar Products</h1>
          <ul className="products-List">
            {similarProductsList.map(product => (
              <SimilarProductItem productData={product} key={product.id} />
            ))}
          </ul>
        </div>
      </>
    )
  }

  renderFailureView = () => (
    <div className="products-error-view-container">
      <img
        src="https://assets.ccbp.in/frontend/react-js/nxt-trendz-error-view-img.png"
        alt="failure view"
        className="products-failure-img"
      />
      <h1 className="product-failure-heading-text">Product Not Found</h1>
      <Link to="/products">
        <button type="button" className="continue-shop-btn">
          Continue Shopping
        </button>
      </Link>
    </div>
  )

  renderLoadingView = () => (
    <div className="products-loader-container" testid="loader">
      <Loader type="ThreeDots" color="#0b69ff" height="50" width="50" />
    </div>
  )

  renderAllProducts = () => {
    const {apiStatus} = this.state

    switch (apiStatus) {
      case apiStatusConstants.success:
        return this.renderProductItemDetails()
      case apiStatusConstants.failure:
        return this.renderFailureView()
      case apiStatusConstants.inProgress:
        return this.renderLoadingView()
      default:
        return null
    }
  }

  render() {
    return (
      <>
        <Header />
        <div className="products-container">{this.renderAllProducts()}</div>
      </>
    )
  }
}

export default ProductItemDetails
