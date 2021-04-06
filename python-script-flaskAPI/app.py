from PIL import Image, ImageFont, ImageDraw 
import matplotlib.pyplot as plt
import matplotlib.image as mpimg
import base64
import numpy as np
from io import BytesIO
from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin

app =  Flask(__name__)

cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

def text_wrap(text, font, max_width):
        lines = []
        # If the text width is smaller than the image width, then no need to split
        # just add it to the line list and return
        if font.getsize(text)[0]  <= max_width:
            lines.append(text)
        else:
            #split the line by spaces to get words
            words = text.split(' ')
            i = 0
            # append every word to a line while its width is shorter than the image width
            while i < len(words):
                line = ''
                while i < len(words) and font.getsize(line + words[i])[0] <= max_width:
                    line = line + words[i]+ " "
                    i += 1
                if not line:
                    line = words[i]
                    i += 1
                lines.append(line)
        return lines


def get_image12(page,fontname,pagetype,word_space,line_height,line_spacing,letter_width, symbols):
  pag1 = Image.open('static/template'+pagetype+'.jpg')
  height = 15
  width = 15
  if (len(page) != 0):
    for lines in page:
      for words in lines.split():
        for letters in words:

          if(letters.isalpha()):
            if (letters.islower()):
              overlay=Image.open('static/'+fontname+'/s'+letters+'.png').convert('RGBA')
            else:
              overlay=Image.open('static/'+fontname+'/'+letters+'.png').convert('RGBA')
          elif (letters.isdigit()):
            overlay=Image.open('static/'+fontname+'/'+letters+'.png').convert('RGBA')
          else:
            if letters in symbols:
              letters = symbols[letters]
            else:
              letters = 'question'
            overlay=Image.open('static/'+fontname+'/'+letters+'.png').convert('RGBA')
          x,y=overlay.size
          pag1.paste(overlay, (width,height,x+width,y+height), overlay)
          width+=(x-letter_width)
        width+=word_space
      height+=line_height
      height+=line_spacing
      width=15
  return pag1


def get_image3(page,pagetype,line_spacing):
  pag1 = Image.open('static/template'+pagetype+'.jpg')
  height = 20
  width = 20
  draw = ImageDraw.Draw(pag1) 
  font = ImageFont.truetype('static/Bestfont10-Regular.ttf', 167) 
  for line in page:
    draw.text((width,height),line,font=font,fill=0)
    height+=line_spacing
  return pag1

@app.route("/", methods=["POST"])
@cross_origin()
def home():
  data = request.json
  text = data['text']
  font = data['font']
  
  letter_width=0 #individual letter width 
  word_space=0 #space between words
  xsize=0 #font width
  ysize=0 #font height
  line_height=0 #height for line placement
  line_spacing=0 #height for line change
  fontname='' #fonttype
  noflines = 0 #noflines in a single page
  pagetype = '' #template used
  limit = 0

  if font==1:
    limit=2393
    letter_width=25 
    word_space=70 
    xsize=70      
    ysize=100     
    line_height=40
    line_spacing=51
    fontname='my font2'
    noflines = 38
    pagetype = '1'

  elif font==2:
    limit=2300
    letter_width= 40
    word_space=45 
    xsize=100      
    ysize=200     
    line_height=99
    line_spacing=59
    fontname='myfont4'
    noflines = 22
    pagetype = '2'

  elif font==3:
    line_height = 104
    line_spacing = 104
    noflines = 33
    pagetype = '3'

  page1 = []
  page2 = []
  page3 = []
  page4 = []

  if (font == 1 or font == 2):

    height = 15
    width = 15

    page = 1

    lines = text.strip().split('\n')

    temp = []

    l = ''

    for line in lines:
      for word in line.split():
        if ((width+len(word)*(xsize-letter_width) + word_space)<=limit):
            width = width + len(word)*(xsize-letter_width)
            width = width + word_space
            l = l + word + ' '
        else:
            width = 15
            if (page == 1):
              page1.append(l)
            elif (page == 2):
              page2.append(l)
            elif (page == 3):
              page3.append(l)
            else:
              page4.append(l)
            l = word + ' '
            width = width + len(word)*(xsize-letter_width)
            width = width + word_space
            height+=line_height
            height+=line_spacing
            if (height>3450):
              page+=1
              height = 15
      width = 15
      if (page == 1):
        page1.append(l)
      elif (page == 2):
        page2.append(l)
      elif (page == 3):
        page3.append(l)
      else:
        page4.append(l)
      l= ''
      height+=line_height
      height+=line_spacing
      if (height>3450):
        page+=1
        if (page == 5):
          break
        height = 15

  if (font == 3):
    fonts = ImageFont.truetype('static/Bestfont10-Regular.ttf', 167) 
    lines = text.strip().split('\n')
    
    x = 20
    y = 20

    final_stemmed = []

    for line in lines:
      lines2 = text_wrap(line, fonts, 2450)
      for prlines in lines2:
        final_stemmed.append(prlines)

    page1 = final_stemmed[0:33]
    page2 = final_stemmed[33:66]
    page3 = final_stemmed[66:99]
    page4 = final_stemmed[99:132]
  

  symbols = {
            '.' : 'fullstop',
            ',' : 'comma',
            '?' : 'question',
            '!' : 'exclamation',
            '{' : 'openingcurly',
            '[' : 'openingsquare',
            '(' : 'openingbracket',
            ')' : 'closingbracket',
            '}' : 'closingcurly',
            ']' : 'closingsquare',
            '\'': 'inverted',
            '“' : 'doubleinverted',
            '”' : 'doubleinverted',
            '‘' : 'inverted',
            '’' : 'inverted',
            '/' : 'slash',
            ':' : 'colon',
            ';' : 'semicolon',
            '=' : 'equals',
            '+' : 'plus',
            '*' : 'multiply',
            '\\': 'backslash',
            '#' : 'hash',
            '$' : 'dollar',
            '@' : 'atsign',
            '~' : 'tilde',
            '`' : 'inverted',
            '^' : 'exponent',
            '-' : 'hyphen',
            '%' : 'percent',
            '<' : 'lessthan',
            '>' : 'greaterthan',
            '_' : 'underscore',
            '|' : 'or',
            '&' : 'ampersand',
            '\"': 'doubleinverted'
        }

  img_str1 = ''
  img_str2 = ''
  img_str3 = ''
  img_str4 = ''

  if (font == 1 or font == 2):
    if (len(page1)!=0):
      image1=get_image12(page1,fontname,pagetype,word_space,line_height,line_spacing,letter_width,symbols)
      buffered = BytesIO()
      image1.save(buffered, format="JPEG")
      img_str1 = base64.b64encode(buffered.getvalue())
    if (len(page2)!=0):
      image1=get_image12(page2,fontname,pagetype,word_space,line_height,line_spacing,letter_width,symbols)
      buffered = BytesIO()
      image1.save(buffered, format="JPEG")
      img_str2 = base64.b64encode(buffered.getvalue())
    if (len(page3)!=0):
      image1=get_image12(page3,fontname,pagetype,word_space,line_height,line_spacing,letter_width,symbols)
      buffered = BytesIO()
      image1.save(buffered, format="JPEG")
      img_str3 = base64.b64encode(buffered.getvalue())
    if (len(page4)!=0):
      image1=get_image12(page4,fontname,pagetype,word_space,line_height,line_spacing,letter_width,symbols)
      buffered = BytesIO()
      image1.save(buffered, format="JPEG")
      img_str4 = base64.b64encode(buffered.getvalue())

  if (font == 3):
    if (len(page1)!=0):
      image1 = get_image3(page1,pagetype,line_spacing)
      buffered = BytesIO()
      image1.save(buffered, format="JPEG")
      img_str1 = base64.b64encode(buffered.getvalue())
    if (len(page2)!=0):
      image1 = get_image3(page2,pagetype,line_spacing)
      buffered = BytesIO()
      image1.save(buffered, format="JPEG")
      img_str2 = base64.b64encode(buffered.getvalue())
    if (len(page3)!=0):
      image1 = get_image3(page3,pagetype,line_spacing)
      buffered = BytesIO()
      image1.save(buffered, format="JPEG")
      img_str3 = base64.b64encode(buffered.getvalue())
    if (len(page4)!=0):
      image1 = get_image3(page4,pagetype,line_spacing)
      buffered = BytesIO()
      image1.save(buffered, format="JPEG")
      img_str4 = base64.b64encode(buffered.getvalue())
  
  final_prod = { '1': str(img_str1), '2':str(img_str2),'3':str(img_str3),'4':str(img_str4) }
  return final_prod

if(__name__=='__main__'):
    app.run()
