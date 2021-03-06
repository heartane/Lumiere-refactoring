/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageNation from 'components/PageNation/PageNation';
import { useComma, convertDeliverStatus } from 'util/functions';
import { EmptyImageWrap } from 'components/ZzimProducts/styled';
import instance from 'util/axios';
import { MypageOrder } from 'util/type';
import { useRecoilState } from 'recoil';
import { LoadingOrderList } from './Loading';
import { IsSigninState } from 'States/IsLoginState';
import { OrderListDummy } from './dummy';
import {
  OrderListContainer,
  ListContainer,
  OrderNumberDescription,
  DtDdWrap,
  ImgWrap,
  ProductDlWrap,
  ProductWrap,
  TotalPriceWrap,
  OrderStatus,
  Management,
  AllProductWrap,
} from './styled';

interface Props {
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const MypageOrderList = ({ isLoading, setIsLoading }: Props) => {
  const [isLogin, setIsLogin] = useRecoilState(IsSigninState);
  const navigate = useNavigate();
  const [curPage, setCurPage] = useState<number>(1);
  const [orderList, setOrderList] = useState<MypageOrder>({
    orders: [
      {
        orderItems: [
          {
            artist: '',
            image: '',
            price: 0,
            product: '',
            size: '',
            title: '',
          },
        ],
        result: {
          id: '',
          paidAt: '',
          status: 0,
          updatedAt: '',
        },
        totalPrice: 0,
        user: '',
        _id: '',
      },
    ],
    page: 1,
    pages: 1,
  });

  useEffect(() => {
    setIsLoading(true);
    instance
      .get('/orders/mine', { params: { pageNumber: curPage } })
      .then((res) => {
        setOrderList(res.data);
        setCurPage(res.data.page);
        setIsLoading(false);
      })
      .catch(() => {
        window.location.assign('/error');
      });
  }, []);

  const pageChangeHandler = (page: number) => {
    setCurPage(page);
    setIsLoading(true);
    instance
      .get('/orders/mine', { params: { pageNumber: page } })
      .then((res) => {
        setOrderList(res.data);
        setCurPage(res.data.page);
        setIsLoading(false);
      })
      .catch((err) => {
        if (err.response.status === 401 && isLogin) {
          alert('???????????? ?????????????????????. ?????? ?????????????????????.');
          localStorage.removeItem('lumiereUserInfo');
          setIsLogin(false);
          window.location.assign('/signin');
        } else window.location.assign('/signin');
      });
  };

  const cancelOrderHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { status, order } = e.currentTarget.dataset;

    if (status === '3' || status === '4' || status === '5') {
      alert('?????? ??????????????? ????????? ???????????????.');
    } else {
      instance
        .delete(`/orders/${order}`)
        .then(() => {
          alert('????????? ?????? ???????????????');
          window.location.reload();
        })
        .catch((err) => {
          if (err.response.status === 401 && isLogin) {
            alert('???????????? ?????????????????????. ?????? ?????????????????????.');
            localStorage.removeItem('lumiereUserInfo');
            setIsLogin(false);
            window.location.assign('/signin');
          }
          alert(`${err.response.data.message}`);
        });
    }
  };

  const refundOrderHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { status, order } = e.currentTarget.dataset;

    if (
      status === '0' ||
      status === '1' ||
      status === '2' ||
      status === '5' ||
      status === '4'
    ) {
      alert('?????? ??????????????? ????????? ????????? ?????????. ?????? ?????? ??? ?????? ????????????');
    } else {
      instance
        .patch(`/orders/${order}`, { status: 4 })
        .then(() => {
          alert('??????????????? ?????????????????????');
          window.location.reload();
        })
        .catch((err) => {
          if (err.response.status === 401 && isLogin) {
            alert('???????????? ?????????????????????. ?????? ?????????????????????.');
            localStorage.removeItem('lumiereUserInfo');
            setIsLogin(false);
            window.location.assign('/signin');
          }
          alert(`${err.response.data.message}`);
          window.location.assign('/error');
        });
    }
  };

  const orderDetailHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    navigate(`/orderdetail/${e.currentTarget.dataset.id}`, {
      state: { id: e.currentTarget.dataset.id },
    });
  };

  return (
    <OrderListContainer>
      {isLoading ? (
        OrderListDummy.map((order) => <LoadingOrderList key={order.id} />)
      ) : orderList.orders[0] !== undefined ? (
        orderList.orders.map((el) => {
          return (
            <div key={el._id}>
              <ListContainer>
                <OrderNumberDescription>
                  <DtDdWrap>
                    <div>
                      <dt>????????????</dt>
                      <dd>{el.result.id}</dd>
                    </div>
                    <div>
                      <dt>????????????</dt>
                      <dd className="smalldd">{el.result.paidAt}</dd>
                    </div>
                  </DtDdWrap>
                  <button
                    type="button"
                    className="detailView"
                    onClick={orderDetailHandler}
                    data-id={el._id}
                  >
                    ????????????
                  </button>
                </OrderNumberDescription>
                <AllProductWrap>
                  {el.orderItems.map((el) => {
                    return (
                      <ProductWrap key={el.product}>
                        <ImgWrap>
                          <img
                            src={el.image}
                            alt={`${el.artist}??? ${el.title}`}
                          />
                        </ImgWrap>
                        <ProductDlWrap>
                          <dt>{el.title}</dt>
                          <dd>{el.artist}</dd>
                          <dd>{el.size}</dd>
                          <dd>{`${useComma(el.price)}???`}</dd>
                        </ProductDlWrap>
                      </ProductWrap>
                    );
                  })}
                </AllProductWrap>
                <TotalPriceWrap>
                  <div className="mobile-Only shipping">
                    {`?????? ${useComma(
                      el.totalPrice - 10000,
                    )}??? + ????????? 10,000???`}
                  </div>
                  <div className="totalPrice">
                    <div className="mobile-Only">??? ?????? ??????</div>
                    <div className="realtotalPrice">{`${useComma(
                      el.totalPrice,
                    )}???`}</div>
                  </div>
                </TotalPriceWrap>
                <OrderStatus>
                  <div>{convertDeliverStatus(el.result.status)}</div>
                </OrderStatus>
                <Management>
                  <button
                    type="button"
                    onClick={cancelOrderHandler}
                    data-status={el.result.status}
                    data-order={el._id}
                  >
                    ??????
                  </button>
                  <button
                    type="button"
                    onClick={refundOrderHandler}
                    data-status={el.result.status}
                    data-order={el._id}
                  >
                    ??????
                  </button>
                </Management>
              </ListContainer>
            </div>
          );
        })
      ) : (
        <EmptyImageWrap>
          <img
            src={`/images/EmptyZzim/hanging-cat-${
              Math.floor(Math.random() * 2) + 1
            }.png`}
            alt="emptyCat"
          />
          <div>?????? ???????????? ?????????!</div>
        </EmptyImageWrap>
      )}
      <PageNation
        curPage={curPage}
        totalPages={orderList.pages}
        pageChangeHandler={pageChangeHandler}
      />
    </OrderListContainer>
  );
};
export default MypageOrderList;
