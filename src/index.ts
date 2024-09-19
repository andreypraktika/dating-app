import './reset.less';
import './index.less';

const modal = document.getElementById('auth_modal') as HTMLElement;
const openModalButton = document.getElementById('openModal') as HTMLElement;
const closeModalButton = document.getElementsByClassName('close')[0] as HTMLElement;
const form = document.getElementById('registrationForm') as HTMLFormElement;
const emailInput = document.getElementById('email') as HTMLInputElement;
const passwordInput = document.getElementById('password') as HTMLInputElement;
const emailError = document.getElementById('emailError') as HTMLElement;
const passwordError = document.getElementById('passwordError') as HTMLElement;

const BACKEND_API = 'https://api.dating.com/identity';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

openModalButton.addEventListener('click', () => {
    const isRedirected = redirectWithToken();

    if (!isRedirected) {
        modal.style.display = 'flex';
    }
});

closeModalButton.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        modal.style.display = 'none';
    }
});

if (form) {
    form.addEventListener('submit', async (event) => {

        event.preventDefault();

        const fieldsAreValid = validateFields();

        if (!fieldsAreValid) {
            return;
        }

        const email = emailInput.value;
        const password = passwordInput.value;

        const isSignInOk = await signIn(email, password);

        if (isSignInOk) {
            handleShowSuccessMessage();
            redirectWithToken();
            return;
        }

        const isSignUpOk = await signUp(email, password);

        if (isSignUpOk) {
            handleShowSuccessMessage();
            redirectWithToken();
            return;
        }
    });
}

const validateFields = () => {
    let isValid = true;
    emailError.innerText = '';
    passwordError.innerText = '';

    if (!emailPattern.test(emailInput.value)) {
        emailError.innerText = 'Email is incorrect';
        isValid = false;
    }

    if (passwordInput.value.length < 8) {
        passwordError.innerText = 'Password must be at least 8 characters';
        isValid = false;
    }

    if (!isValid) {
        return false;
    }

    return true;
}

const signUp = async (email: string, password: string) => {
    try {
        const response = await fetch(BACKEND_API, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            throw new Error();
        }

        const xToken = response.headers.get('x-token');

        if (xToken) {
            storeXTokenInLocalStorage(xToken);
        }
        return response.ok;
    } catch (error) {
        console.error('Error:', error);
    }
}

const signIn = async (email: string, password: string) => {
    try {
        const credentials = btoa(`${email}:${password}`);
        const response = await fetch(BACKEND_API, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${credentials}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to authenticate');
        }

        const xToken = response.headers.get('x-token');

        if (xToken) {
            storeXTokenInLocalStorage(xToken);
        }

        return response.ok;
    } catch (error) {
        console.error('Error:', error);
    }
}

const handleShowSuccessMessage = () => {
    const successSection = document.getElementById('successSection') as HTMLElement;

    if (successSection) {
        successSection.style.display = 'flex';
        form.style.display = 'none';
    }
}

const storeXTokenInLocalStorage = (token: string) => {
    localStorage.setItem('token', token);
}

const findTokenFromLocalStorage = (): string | undefined => {
    const token = localStorage.getItem('token');

    if (token) return token;
}

const redirectWithToken = () => {
    const redirect = (token: string) => {
        window.location.href = `https://www.dating.com/people/#token=${token}`
    }

    const token = findTokenFromLocalStorage();

    if (token) {
        redirect(token);
        return true;
    }
}


