/*
   Copyright (C) 2010 Team XBMC
   http://www.xbmc.org
   Copyright (C) 2011 Stefanos A.
   http://www.opentk.com

This Program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2, or (at your option)
any later version.

This Program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with XBMC; see the file COPYING.  If not, write to
the Free Software Foundation, 675 Mass Ave, Cambridge, MA 02139, USA.
http://www.gnu.org/copyleft/gpl.html
*/

// Default to Mitchel-Netravali coefficients for best psychovisual result
// bicubic-sharp is B = 0.1 and C = 0.5
// bicubic-sharper is B = 0.0 and C = 0.75
#pragma parameter B "Bicubic Coeff B" 0.33 0.0 1.0 0.01
#pragma parameter C "Bicubic Coeff C" 0.33 0.0 1.0 0.01

#if defined(VERTEX)

#if __VERSION__ >= 130
#define COMPAT_VARYING out
#define COMPAT_ATTRIBUTE in
#define COMPAT_TEXTURE texture
#else
#define COMPAT_VARYING varying 
#define COMPAT_ATTRIBUTE attribute 
#define COMPAT_TEXTURE texture2D
#endif

#ifdef GL_ES
#define COMPAT_PRECISION mediump
#else
#define COMPAT_PRECISION
#endif

COMPAT_ATTRIBUTE vec4 VertexCoord;
COMPAT_ATTRIBUTE vec4 TexCoord;
COMPAT_VARYING vec4 TEX0;

uniform mat4 MVPMatrix;
uniform COMPAT_PRECISION int FrameDirection;
uniform COMPAT_PRECISION int FrameCount;
uniform COMPAT_PRECISION vec2 OutputSize;
uniform COMPAT_PRECISION vec2 TextureSize;
uniform COMPAT_PRECISION vec2 InputSize;

// compatibility #defines
#define vTexCoord TEX0.xy
#define SourceSize vec4(TextureSize, 1.0 / TextureSize) //either TextureSize or InputSize
#define OutSize vec4(OutputSize, 1.0 / OutputSize)

void main()
{
   gl_Position = MVPMatrix * VertexCoord;
   TEX0.xy = TexCoord.xy;
}

#elif defined(FRAGMENT)

#ifdef GL_ES
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
#define COMPAT_PRECISION mediump
#else
#define COMPAT_PRECISION
#endif

#if __VERSION__ >= 130
#define COMPAT_VARYING in
#define COMPAT_TEXTURE texture
out COMPAT_PRECISION vec4 FragColor;
#else
#define COMPAT_VARYING varying
#define FragColor gl_FragColor
#define COMPAT_TEXTURE texture2D
#endif

uniform COMPAT_PRECISION int FrameDirection;
uniform COMPAT_PRECISION int FrameCount;
uniform COMPAT_PRECISION vec2 OutputSize;
uniform COMPAT_PRECISION vec2 TextureSize;
uniform COMPAT_PRECISION vec2 InputSize;
uniform sampler2D Texture;
COMPAT_VARYING vec4 TEX0;

// compatibility #defines
#define Source Texture
#define vTexCoord TEX0.xy

#define SourceSize vec4(TextureSize, 1.0 / TextureSize) //either TextureSize or InputSize
#define OutSize vec4(OutputSize, 1.0 / OutputSize)

#ifdef PARAMETER_UNIFORM
uniform COMPAT_PRECISION float B, C;
#else
#define B 0.3333
#define C 0.3333
#endif

void main()
{
   // We're going to sample a a 4x4 grid of texels surrounding the target UV coordinate. We'll do this by rounding
    // down the sample location to get the exact center of our "starting" texel. The starting texel will be at
    // location [1, 1] in the grid, where [0, 0] is the top left corner.
    vec2 texSize = SourceSize.xy;
    vec2 invTexSize = 1.0 / texSize;
    vec2 iTc = vTexCoord * texSize;

    vec2 tc = floor(iTc - vec2(0.5)) + vec2(0.5);

    // Compute the fractional offset from our starting texel to our original sample location, which we'll
    // feed into the B-Spline function to get our filter weights.
    vec2 f  = iTc - tc;
    vec2 f2 = f * f;
    vec2 f3 = f2 * f;

    vec2 lf  = vec2(1.) + f;
    vec2 lf2 = lf * lf;
    vec2 lf3 = lf2 * lf;

    vec2 rf  = vec2(2.) - f;
    vec2 rf2 = rf * rf;
    vec2 rf3 = rf2 * rf;

    vec2 w0 = ((-B-6.*C)*lf3+(6.*B+30.*C)*lf2+(-12.*B-48.*C)*lf+(8.*B+24.*C))/6.0;
    vec2 w1 = ((12.-9.*B-6.*C)*f3+(-18.+12.*B+6.*C)*f2+(6.-2.*B))/6.0;
    vec2 w3 = ((-B-6.*C)*rf3+(6.*B+30.*C)*rf2+(-12.*B-48.*C)*rf+(8.*B+24.*C))/6.0;
    vec2 w2 = vec2(1.) - w0 - w1 - w3;

    vec2 Weight[3];
    vec2 Sample[3];

    Weight[0] = w0;
    Weight[1] = w1 + w2;
    Weight[2] = w3;

    Sample[0] = tc - vec2(1.);
    Sample[1] = tc + w2 / Weight[1];
    Sample[2] = tc + vec2(2.);

    Sample[0] *= invTexSize;
    Sample[1] *= invTexSize;
    Sample[2] *= invTexSize;

    float sampleWeight[5];
    sampleWeight[0] = Weight[1].x * Weight[0].y;
    sampleWeight[1] = Weight[0].x * Weight[1].y;
    sampleWeight[2] = Weight[1].x * Weight[1].y;
    sampleWeight[3] = Weight[2].x * Weight[1].y;
    sampleWeight[4] = Weight[1].x * Weight[2].y;

    vec3 Ct = COMPAT_TEXTURE(Source, vec2(Sample[1].x, Sample[0].y)).rgb * sampleWeight[0];    
    vec3 Cl = COMPAT_TEXTURE(Source, vec2(Sample[0].x, Sample[1].y)).rgb * sampleWeight[1];    
    vec3 Cc = COMPAT_TEXTURE(Source, vec2(Sample[1].x, Sample[1].y)).rgb * sampleWeight[2];    
    vec3 Cr = COMPAT_TEXTURE(Source, vec2(Sample[2].x, Sample[1].y)).rgb * sampleWeight[3];    
    vec3 Cb = COMPAT_TEXTURE(Source, vec2(Sample[1].x, Sample[2].y)).rgb * sampleWeight[4];
    
    float WeightMultiplier = 1./(sampleWeight[0]+sampleWeight[1]+sampleWeight[2]+sampleWeight[3]+sampleWeight[4]);

    FragColor = vec4((Ct+Cl+Cc+Cr+Cb)*WeightMultiplier, 1.0);
} 
#endif
