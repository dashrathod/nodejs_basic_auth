function errorToast(params) {
    $(document).Toasts('create', {
        body: params.body || "",
        title: params.title || "",
        position: "bottomRight",
        autohide: true,
        icon: "fas fa-exclamation-triangle",
        delay: 3000,
        class: 'text-danger bg-danger m-2',
    })
}

function successToast(params) {
    $(document).Toasts('create', {
        body: params.body || "",
        title: params.title || "",
        position: "bottomRight",
        autohide: true,
        icon: "fas fa-check",
        delay: 3000,
        class: 'text-success bg-success m-2',
    })
}

if (successMsg) {
    successToast({ body: successMsg, title: "SUCCESS" });
}
if (errorMsg) {
    errorToast({ body: errorMsg, title: "DANGER" });
}