import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/*const subscriptions = [
    { id: 1, name: 'Netflix', price: 15.99 },
    { id: 2, name: 'Spotify', price: 9.99 },
    { id: 3, name: 'Hulu', price: 11.99 },
    { id: 4, name: 'Disney+', price: 7.99 },
  ];*/


interface SubscriptionType {
  _id: string;
  UserId: string;
  SubscriptionName: string;
  Price: number;
}

function Subscription() {

  const [message, setMessage] = useState('');
  const [subscriptionName, setSubscriptionName] = useState('');
  const [price, setPrice] = useState('');
  const [subscriptions, setSubscriptions] = useState<SubscriptionType[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setSubscriptionName('');
    setPrice('');
  };

  const handleAddSubscription = async (event:any) => {
    event.preventDefault();
    // Validate inputs
    if (!subscriptionName || !price) {
      alert('Please enter both subscription name and price.');
      return;
    }

    const success = addSubscription(event)
    if(success != null)
      console.log("Subscription added")
    
    // Close the modal after processing
    closeModal();
  };

  async function addSubscription(event: any): Promise<void> {
    event.preventDefault();

    const userDataString = localStorage.getItem('user_data');
    let userId = '';
    if (userDataString) {
        try {
            const userData = JSON.parse(userDataString);
            if(!userData.id) {
              alert("no user data found");
              return;
            }
            userId = userData.id;
        } catch (error) {
            console.error('Error parsing user data from localStorage:', error);
        }
    } 

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice)) {
      alert('Please enter a valid number for the price.');
      return;
    }

    const obj = {
      userId: userId,
      subscriptionName: subscriptionName,
      price: parsedPrice
    };

    const js = JSON.stringify(obj);

    try {
      const response = await fetch('http://localhost:5000/api/addSubscription', {
        method: 'POST',
        body: js,
        headers: { 'Content-Type': 'application/json' }
      });

      const res = JSON.parse(await response.text());
      const refresh = await loadSubscriptions();

      if (res.error) {
        setMessage(res.error);
      } else {
        setMessage('Subscription Added!');
        loadSubscriptions();
      }
    } catch (error: any) {
      alert(error.toString());
    }
  }

  const loadSubscriptions = async() => {

    const userDataString = localStorage.getItem('user_data');
    let userId = '';
    if (userDataString) {
        try {
            const userData = JSON.parse(userDataString);
            if(!userData.id) {
              alert("no user data found");
              return;
            }
            userId = userData.id;
        } catch (error) {
            console.error('Error parsing user data from localStorage:', error);
        }
    }
    
    let obj = { userId: userId };
        let js = JSON.stringify(obj);
        try {
            const response = await
                fetch('http://localhost:5000/api/loadSubscriptions',
                    {
                        method: 'POST', body: js, headers: {
                            'Content-Type':
                                'application/json'
                        }
                    });

            const data = await response.json();
            console.log(data);
            setSubscriptions(data);
        }
        catch (error: any) {
            alert(error.toString());
        }
  }

  
  const handleRemove = async (id: string) => {

    let obj = { id: id };
    let js = JSON.stringify(obj);

    try {
      const response = await fetch(`http://localhost:5000/api/removeSubscription`,
         {
            method: 'POST', body: js, headers: {
              'Content-Type':
                  'application/json'
            }
        });

        const refresh = await loadSubscriptions();
  
        const data = await response.json();
        console.log("subscription removed");
      } catch (error) {
        console.error('Request error:', error);
      }
    };

  const navigate = useNavigate();
  const handleDashboard = () => {
    navigate('/dashboard');
  };

  useEffect(() => {
    loadSubscriptions();
  }, []);

  return (
    <div className="subscription-page">
      <header className="subscription-header">
        <h1>Subscriptions</h1>
      </header>

      <main className="subscription-content">
        <h1>Your monthly payment for subscriptions</h1>
        <div className="total-amount">
          <strong>Total Amount Spent: </strong>
          <span>
            ${subscriptions.reduce((acc, subscription) => acc + subscription.Price, 0).toFixed(2)}/month
          </span>
        </div>
        <ul className="subscriptionList"> 
          {subscriptions.length > 0 ? (
            subscriptions.map((subscription, index) => (
                <li key={index} className="subscription-item">
                  <span className="subscription-name">{subscription.SubscriptionName}</span>
                  <span className="subscription-price">${subscription.Price}</span>
                  <button className="subscription-remove-btn" onClick={() => handleRemove(subscription._id)}>remove</button>
                </li>
              ))
            ) : (
                <li className="subscription-item">No subscriptions added yet.</li>
              )}
        </ul>
      </main>

      <footer className="subscription-footer">
        <button className="dashboard-btn" onClick={handleDashboard}>Back to Dashboard</button>
        <button className="dashboard-btn" onClick={openModal}>Add Subscription</button>
      </footer>
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Add Subscription</h2>
            <label>
              Subscription Name:
              <input
                type="text"
                value={subscriptionName}
                onChange={(e) => setSubscriptionName(e.target.value)}
              />
            </label>
            <label>
              Price:
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </label>
            <div className="modal-actions">
              <button onClick={handleAddSubscription}>Add</button>
              <button onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscription;
