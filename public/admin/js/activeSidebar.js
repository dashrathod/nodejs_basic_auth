
switch (pageTitle) {
    case 'User':
        $('.nav-link').removeClass('active');
        jQuery('#users_nav').addClass('active');
        break;

    case 'Host':
        $('.nav-link').removeClass('active');
        jQuery('#hosts_nav').addClass('active');
        break;

    case 'Payments':
        $('.nav-link').removeClass('active');
        jQuery('#payments_nav').addClass('active');
        break;

    case 'Settings':
        $('.nav-link').removeClass('active');
        jQuery('#settings_nav').addClass('active');
        break;

    default:
        $('.nav-link').removeClass('active');
        jQuery('#dashboard_nav').addClass('active');
        break;
}