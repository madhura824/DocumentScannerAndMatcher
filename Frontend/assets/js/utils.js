function clearErrors() {
    document.querySelectorAll(".error-message").forEach((element) => {
        element.innerHTML = "";
    });
}


document.getElementById('logout')?.addEventListener('click', logout);


async function logout() {

    if (localStorage.getItem('jwtTokenUser')) {
        localStorage.removeItem('jwtTokenUser');
    } else if (localStorage.getItem('jwtTokenAdmin')) {
        localStorage.removeItem('jwtTokenAdmin');
    }

    window.location.href = '/pages/login.html';
}


