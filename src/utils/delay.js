function delay(t, val) {
    return new Promise(resolve => setTimeout(resolve, t, val));
}

export default delay;