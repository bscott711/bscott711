import numpy as np


def lightsheet_properties(x_mm, f_mm, n, theta_t, lambda_um, verbose=True):
    a = 2*(2*np.log(2))**0.5 * f_mm * np.sin(theta_t) * lambda_um
    w_fwhm_um = a / (np.pi * x_mm)
    z_s_um = (np.pi * n * w_fwhm_um**2) / (3*np.log(2) * lambda_um)
    if verbose:
        print('Lightsheet_properties ' +
              '(x_mm=%0.2f, f_mm=%0.2f, n=%0.2f, theta_t=%0.2f, lambda_um=%0.2f):' % (
                  x_mm, f_mm, n, np.rad2deg(theta_t), lambda_um))
        print('w_fwhm_um=%0.2f' % w_fwhm_um)
        print('z_s_um=%0.2f' % z_s_um)
        print('')
    return w_fwhm_um, z_s_um


if __name__ == "__main__":
    # SOLS original prototype microscope:
    x_aperture_mm = 0.5
    aperture_to_BFP_mag = (357 / 200)
    x_mm = x_aperture_mm / aperture_to_BFP_mag

    lightsheet_properties(x_mm, 2, 1.41, np.deg2rad(30), 0.532)
