import uuid


class OwnedSet:
    def __init__(self, guid: str, set_number: str, name: str, purchase_price: float, average_price: float,
                 average_price_half_year: float, overpriced: bool, missing_pieces: list,
                 origin: str, has_manual: bool, has_box: bool, set_img_url: str):
        """
        Initialize an instance of the OwnedSet class.

        :param set_number: The set number of the LEGO set.
        :param name: The name of the LEGO set.
        :param purchase_price: The price at which the set was purchased.
        :param average_price: The current average market price of the set.
        :param average_price_half_year: The average market price of the set over the last half-year.
        :param overpriced: Boolean indicating whether the set was purchased at an overpriced rate.
        :param missing_pieces: A list of missing piece identifiers (as strings).
        :param origin: The origin of the set (e.g., "retail", "second-hand").
        :param has_manual: Boolean indicating whether the set includes its manual.
        """
        self.guid = str(uuid.uuid4())
        self.set_number = set_number
        self.name = name
        self.purchase_price = purchase_price
        self.average_price = average_price
        self.average_price_half_year = average_price_half_year
        self.overpriced = overpriced
        self.missing_pieces = missing_pieces
        self.missing_piece_count = len(missing_pieces)
        self.origin = origin
        self.has_manual = has_manual
        self.has_box = has_box
        self.set_img_url = set_img_url

    def __repr__(self):
        return (f"OwnedSet(guid='{self.guid}, set_number='{self.set_number}', name='{self.name}', "
                f"purchase_price={self.purchase_price}, average_price={self.average_price}, "
                f"average_price_half_year={self.average_price_half_year}, overpriced={self.overpriced}, "
                f"missing_pieces={self.missing_pieces}, missing_piece_count={self.missing_piece_count}, "
                f"origin='{self.origin}', has_manual={self.has_manual}), has_box={self.has_box}, "
                f"set_img_url='{self.set_img_url}'")

    def to_dict(self):
        return {
            'guid': self.guid,
            'set_number': self.set_number,
            'name': self.name,
            'purchase_price': self.purchase_price,
            'average_price': self.average_price,
            'average_price_half_year': self.average_price_half_year,
            'overpriced': self.overpriced,
            'missing_pieces': self.missing_pieces,
            'missing_piece_count': self.missing_piece_count,
            'origin': self.origin,
            'has_manual': self.has_manual,
            'has_box': self.has_box,
            'set_img_url': self.set_img_url
        }

    @classmethod
    def from_dict(cls, data: dict):
        return cls(
            guid=data.get('guid'),
            set_number=data['set_number'],
            name=data['name'],
            purchase_price=data['purchase_price'],
            average_price=data['average_price'],
            average_price_half_year=data['average_price_half_year'],
            overpriced=data['overpriced'],
            missing_pieces=data['missing_pieces'],
            origin=data['origin'],
            has_manual=data['has_manual'],
            has_box=data['has_box'],
            set_img_url=data['set_img_url']
        )
