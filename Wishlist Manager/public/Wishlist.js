let user = null;
let selectedWishlistId = null;
let wishlists = []; // Define the wishlists array
let wishlistItems = null;
let createdWishlist = null;
// Define a variable to store the previously selected wishlist
let previouslySelectedWishlistId = null;
//const scrapeWebsite = require('./Webscraper');

//let noWishlistMessage = document.getElementById('no-wishlist-message');

function toggleBanners(isLoggedIn) {
  document.getElementById('logged-in-banner').style.display = isLoggedIn ? 'none' : 'block';
  document.getElementById('login-banner').style.display = isLoggedIn ? 'block' : 'none';
  console.log(isLoggedIn);
}


function handleLoginbuttonClick(button) {
  // Remove active class from all buttons in the banner
  const buttons = document.querySelectorAll("#login-banner button");
  buttons.forEach(btn => btn.classList.remove("active"));

  // Add active class to the clicked button
  button.classList.add("active");

  // Toggle sidebar visibility only if "My Wishlist" button is clicked
  if (button.innerText === "My Wishlist") {
    toggleSidebar();
  }
}


function handleButtonClick(button) {
  // Remove active class from all buttons in the banner
  const buttons = document.querySelectorAll("#logged-in-banner button");
  buttons.forEach(btn => btn.classList.remove("active"));

  // Add active class to the clicked button
  button.classList.add("active");

  // Toggle sidebar visibility only if "My Wishlist" button is clicked
  if (button.innerText === "My Wishlist") {
    toggleSidebar();
  }
}

// Function to toggle sidebar visibility
function toggleSidebar() {
  var sidebar = document.getElementById("sidebar");
  if (sidebar.style.display === "none") {
    sidebar.style.display = "block";
  } else {
    sidebar.style.display = "none";
  }
}

// Separate function to handle selecting a wishlist
function selectWishlist(wishlistId) {
  previouslySelectedWishlistId = selectedWishlistId;


  // After selecting a wishlist, toggle the visibility of the wishlist content
  toggleWishlistContentVisibility(true);

  // Hide the "Please select a wishlist" message
  noWishlistMessage = document.getElementById('no-wishlist-message');
  noWishlistMessage.style.display = 'none';

  selectedWishlistId = wishlistId;
  chooseWishlist(wishlistId);
}

// Call this function when no wishlist is selected
function clearSelectedWishlist() {
  // Your existing code here to clear the selected wishlist

  // After clearing the selected wishlist, hide the wishlist content
  toggleWishlistContentVisibility(false);

  // Show the "Please select a wishlist" message
  noWishlistMessage = document.getElementById('no-wishlist-message');
  noWishlistMessage.style.display = 'block';


}

function getToken() {
  // Retrieve the token from local storage
  const token = localStorage.getItem('token');
  return token;
}

// Function to show the spinner
function showSpinner() {
  document.getElementById('spinner').style.display = 'block';
  // Show the overlay when loading starts
  document.getElementById('table-overlay').style.display = 'block';
}

// Function to hide the spinner
function hideSpinner() {
  document.getElementById('spinner').style.display = 'none';

  // Hide the overlay when loading is complete
  document.getElementById('table-overlay').style.display = 'none';
}


// Function to show the registration section and hide the login section
function showRegistration() {
  document.getElementById('login-section').style.display = 'none';
  document.getElementById('wishlist-section').style.display = 'none';
  document.getElementById('sidebar').style.display = 'none';
  document.getElementById('login-banner').style.display = 'block';
  document.getElementById('register-section').style.display = 'block';
  document.getElementById('logged-in-banner').style.display = 'none';
}

// Function to fetch and display existing wishlists in the sidebar
async function fetchWishlists() {
  console.log("Bing bada bing bada bing bad a boom")
  const token = getToken();
  try {
    const response = await fetch('http://localhost:3000/wishlists', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    wishlists = data.wishlists;
    const wishlistList = document.getElementById('wishlist-list');
    wishlistList.innerHTML = '';

    // Clear the "selected" class from all list items
    $('#wishlist-list li').removeClass('selected');


    wishlists.forEach(wishlist => {
      const listItem = document.createElement('li');
      listItem.innerHTML = `
      <li data-wishlist-id="${wishlist.id}">
      <span>${wishlist.name}</span>

      <button class="remove-button" onclick="removeWishlist(${wishlist.id})">
        <i class="fa fa-trash"></i>
      </button>
      </li>`;

      // Handle selection of the wishlist
      listItem.onclick = () => {
        selectWishlist(wishlist.id);
        //  $(listItem).addClass('selected');
      };

      wishlistList.appendChild(listItem)
      // Add a class to the list item for styling
      listItem.classList.add('wishlist-item');
      wishlistList.appendChild(listItem);
    });

    // Highlight the selected wishlist if there is one
    if (selectedWishlistId !== null) {
      $(`#wishlist-list li[data-wishlist-id="${selectedWishlistId}"]`).addClass('selected');
    }

  } catch (error) {
    console.error('Error fetching wishlists:', error);
    // Handle error gracefully
  }
}

// Function to show the login section and hide the registration section
function showLogin() {
  document.getElementById('login-section').style.display = 'block';
  document.getElementById('register-section').style.display = 'none';
  document.getElementById('sidebar').style.display = 'none';
  document.getElementById('login-banner').style.display = 'block';
  document.getElementById('logged-in-banner').style.display = 'none';
}

async function register() {
  const username = document.getElementById('register-username').value;
  const password = document.getElementById('register-password').value;

  try {
    const response = await fetch('http://localhost:3000/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    if (response.ok) {
      // Registration successful, switch to login section
      showLogin();
    } else {
      throw new Error('Registration failed');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred during registration. Please try again.');
  }
}

async function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    const token = data.token; // Extract the token from the response

    if (token) {
      user = username;
      // Store the token securely, e.g., in a cookie or local storage
      localStorage.setItem('token', token);

      document.getElementById('login-section').style.display = 'none';
      document.getElementById('wishlist-section').style.display = 'block';
      document.getElementById('sidebar').style.display = 'block';

      toggleBanners();
      // Call the function to toggle the visibility of the "New Wishlist" button
      await toggleNewWishlistButton();
      // Fetch and display wishlists in the sidebar
      await fetchWishlists();
      clearSelectedWishlist();


    } else {
      document.getElementById('register-section').style.display = 'block';
      alert('Invalid credentials. You can also register a new account.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred. Please try again.');
  }
}

// Update the function to toggle the visibility of the button
async function toggleNewWishlistButton() {
  const token = getToken();
  if (token) {
    // User is logged in, show the button
    document.getElementById('new-wishlist-button').style.display = 'block';
  } else {
    // User is not logged in, hide the button
    document.getElementById('new-wishlist-button').style.display = 'none';
  }
}

window.onload = () => {
  const token = getToken();
  const isLoggedIn = !!token; // true if token exists, false otherwise
  toggleBanners(isLoggedIn);
  toggleNewWishlistButton();
};

// Function to create a new wishlist
async function createNewWishlist() {
  const wishlistName = prompt('Enter wishlist name:');

  if (!wishlistName || !wishlistName.trim()) {
    alert('Wishlist name cannot be empty or contain only whitespace.');
    return;
  }

  if (wishlistName) {
    try {
      const token = getToken();
      const response = await fetch('http://localhost:3000/createWishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ wishlistName }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // Parse the response to get the created wishlist and wishlistId
      //const { wishlistId } = await response.json();
      const { id: wishlistId } = await response.json();
      // Add this line to add the newly created wishlist to the wishlists array
      wishlists.push({ id: wishlistId, name: wishlistName });

      // Select the newly created wishlist
      selectWishlist(wishlistId);
      ////////////////////////////////////////////////////////////

      await fetchWishlists(); // Refresh the wishlist sidebar


    } catch (error) {
      console.error('Error creating wishlist:', error);
      // Handle error gracefully
    }
  }
}

//FINDME
async function removeWishlist(wishlistId) {
  try {
    const token = getToken();
    const response = await fetch(`http://localhost:3000/removeWishlist/${wishlistId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    // Remove the deleted wishlist from the array
    wishlists = wishlists.filter(wishlist => wishlist.id !== wishlistId);



    // Check if the deleted wishlist was the previously selected one
    if (wishlistId === previouslySelectedWishlistId) {
      previouslySelectedWishlistId = null;
      selectWishlist(null);
      clearSelectedWishlist();
    } else {
      selectWishlist(previouslySelectedWishlistId);
    }
    await fetchWishlists();


    console.log("selectedwishlist after null setting", selectedWishlistId);
  } catch (error) {
    console.error('Error removing wishlist:', error);
    // Handle error gracefully
  }
}

// Function to show/hide the wishlist content based on the selected wishlist
function toggleWishlistContentVisibility(show) {
  const wishlistContent = document.getElementById('wishlist-section');
  if (show) {
    wishlistContent.style.display = 'block';
  } else {
    wishlistContent.style.display = 'none';
  }
}




async function chooseWishlist(wishlistId) {
  try {
    const token = getToken();
    const response = await fetch(`http://localhost:3000/wishlist?wishlistId=${wishlistId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    console.log("boo list : ", selectedWishlistId)
    const data = await response.json();
    // console.log("wishlistId ", wishlistId)
    //condition inserted for removewishlist. The wishlistId will be null from the removewishlist() if it the wishlist selected for delete is the current one selected. Meaning Selected Id will have a value and may be different from the . What this condition then translates to is: 
    //If the wishlist selected is not null and the wishlistId we are choosing (ie via removewishlist) is not null then show wishlist items
    if (wishlistId !== null && selectedWishlistId !== null) {
      wishlistItems = data.wishlistItems;
    } else {
      wishlistItems = null;
    }

    //const wishlistItems = data.wishlistItems;
    // selectedWishlistId = wishlistId;

    console.log("coose list: ", selectedWishlistId)
    console.log("items in wishlist: ", wishlistItems)
    // Populate and display the selected wishlist

    await fetchWishlists();

    await displayWishlist(wishlistItems);

  } catch (error) {
    console.error('Error fetching wishlist:', error);
    // Handle error gracefully
  }
}

async function displayWishlist(wishlistItems) {
  clearWishlist();
  //console.log("diplayed wishlist items: ", wishlistItems)
  if (wishlistItems !== null) {

    const table = document.getElementById('wishlistTable');
    const tableBody = table.querySelector('tbody');
    tableBody.innerHTML = ''; // Clear existing items
    wishlistItems.forEach(item => {
      const newRow = tableBody.insertRow(tableBody.rows.length);
      newRow.innerHTML = `
      <td>${item.product_name}</td>
      <td>${item.price}</td>
      <td>${item.website}</td> <!-- Populate the website column -->
      <td><img src="${item.image_url}" alt="${item.product_name}" width="50"></td>
      <td><a href="${item.url}" target="_blank">Link</a></td>
      <td>
      <button class="refresh-button" onclick="refreshItem(${item.id})">Refresh</button> <!-- Add the refresh button --> 
      </td>
      <td>
        <button class="remove-button" onclick="removeItem(this, ${item.id})"><i class="fas fa-trash"></i>
        </button>
      </td>
    `;
    });
  }
}

function extractDomain(url) {
  // Use a regular expression to extract the domain
  const domainRegex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n?]+).*/i;
  const matches = url.match(domainRegex);

  if (matches && matches.length > 1) {
    return matches[1];
  }

  // Return null if the domain couldn't be extracted
  return null;
}

async function addItem() {
  showSpinner();
  const productUrl = document.getElementById('productUrl').value;

  // Make an AJAX request to the server to trigger web scraping
  try {
    const response = await fetch(`http://localhost:3000/scrape?productUrl=${encodeURIComponent(productUrl)}`);

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const productInfo = await response.json();
    const wishlistName = selectedWishlistId;
    // Extract information from productInfo object
    const website = extractDomain(productUrl);
    const productName = productInfo.productName;
    const price = productInfo.price;
    const imageUrl = productInfo.imageUrl;
    const link = productInfo.productUrl;

    // Retrieve the token from storage
    const token = localStorage.getItem('token');

    // Make an AJAX request to the server to add the item to the database
    const addResponse = await fetch('http://localhost:3000/addItem', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Include the token in the Authorization header
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        productName,
        price,
        imageUrl,
        link,
        wishlistName,
        website,
      }),
    });

    console.log("wishlistName ", wishlistName);

    console.log("website ", website);

    if (addResponse.ok) {
      hideSpinner(); // Hide the spinner after scraping is complete
      // Item added successfully
      const table = document.getElementById('wishlistTable');
      const tableBody = table.querySelector('tbody');
      const newRow = tableBody.insertRow(tableBody.rows.length);
      newRow.innerHTML = `
        <td>${productName}</td>
        <td>${price}</td>
        <td>${website}</td>
        <td><img src="${imageUrl}" alt="${productName}" width="50"></td>
        <td><a href="${productUrl}" target="_blank">Link</a></td>
        <td><button class="remove-button" onclick="removeItem(this)">Remove</button></td>
      `;

      document.getElementById('productUrl').value = '';
    } else {
      hideSpinner(); // Hide the spinner after scraping is complete
      throw new Error('Item could not be added to the wishlist');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred while fetching product information or adding to wishlist. Please try again.');
    hideSpinner(); // Hide the spinner after scraping is complete
  }
}

async function refreshItem(itemId) {
  try {
    const token = getToken();

    const response = await fetch(`http://localhost:3000/refreshItem/${itemId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    // Implement any necessary logic to update the item data after refresh

  } catch (error) {
    console.error('Error refreshing item:', error);
    // Handle error gracefully
  }
}





function clearWishlist() {
  const tableBody = document.querySelector('#wishlistTable tbody');
  while (tableBody.firstChild) {
    tableBody.removeChild(tableBody.firstChild);
  }
}


async function removeItem(button, itemId) {
  const row = button.parentNode.parentNode;
  const table = document.getElementById('wishlistTable');

  try {
    const token = getToken(); // Implement this function to get the token from storage

    const response = await fetch(`http://localhost:3000/removeItem/${itemId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    table.deleteRow(row.rowIndex);
  } catch (error) {
    console.error('Error removing item:', error);
    // Handle error gracefully
  }
}

