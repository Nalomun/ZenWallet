'use client';

import { useState, useEffect } from 'react';
import { getVisaOffers, type VisaOffer } from '@/lib/visaApi';

export default function VisaOffers() {
  const [offers, setOffers] = useState<VisaOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOffers();
  }, []);

  async function loadOffers() {
    setLoading(true);
    // Oakland, CA coordinates
    const offerData = await getVisaOffers(37.8044, -122.2712, 5);
    setOffers(offerData);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (offers.length === 0) {
    return null;
  }

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🎁</span>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Visa Card Offers
            </h2>
            <p className="text-sm text-gray-600">Save more with card-linked discounts</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
          Powered by Visa
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {offers.map((offer, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border-2 border-green-200 hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            <div className="flex items-start gap-3 mb-3">
              {offer.logo_url && (
                <img 
                  src={offer.logo_url} 
                  alt={offer.merchant_name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg">{offer.merchant_name}</h3>
                <p className="text-green-700 font-bold text-sm">
                  {offer.discount_percentage 
                    ? `${offer.discount_percentage}% OFF` 
                    : `$${offer.discount_amount} OFF`}
                </p>
              </div>
            </div>

            <p className="text-gray-700 text-sm mb-3">{offer.offer_description}</p>

            <div className="flex items-center justify-between text-xs">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">
                {offer.category}
              </span>
              <span className="text-gray-500">
                Valid until {new Date(offer.valid_until).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <p className="text-sm text-blue-900">
          <span className="font-bold">💡 How it works:</span> These offers are automatically applied when you use your Visa card at these merchants. No coupons needed!
        </p>
      </div>
    </div>
  );
}