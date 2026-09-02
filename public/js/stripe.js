/* eslint-disable*/
import axios from 'axios';
import { showAlert } from './alerts';
// const stripe = Stripe(
//  'pk_test_51UB05Z6yaLNZxvFpu4Q4wCucfT4qsCMsBM4OXPt5JqwUVGRhivwd6kcLb9XuqlOak8HOYhSerjgMsmHVSh9dDkVF00KaqFIAnf',
//);

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    // 2) Create checkout form + charge credit card
    //  await stripe.redirectToCheckout({
    //    sessionId: session.data.session.id,
    //  });
    window.location.assign(session.data.session.url);
  } catch (err) {
    console.log(err);
    showAlert('error', err.response?.data?.message || err.message);
  }
};
